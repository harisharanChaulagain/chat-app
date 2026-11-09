import { Request, Response } from "express";
import { Types } from "mongoose";
import Like from "../models/like.model";
import Match, { orderedPair } from "../models/match.model";
import Report from "../models/report.model";
import User, { IUser } from "../models/user.model";
import Conversation from "../models/conversation.model";
import MessageModel from "../models/message.model";
import { findOrCreateDirectConversation } from "../services/conversation.service";
import { getReceiverSocketId, io } from "../socketio/server";
import {
  birthDateBoundsForAges,
  blockedIdsFor,
  escapeRegex,
  gendersForPreference,
  isBlockedBetween,
  preferencesMatching,
  publicProfile,
} from "../services/dating.service";
import {
  discoverQuerySchema,
  reportSchema,
} from "../validation/dating.validation";

/** Everything `publicProfile` reads — nothing private ever leaves the query. */
const PROFILE_FIELDS =
  "name birthDate gender bio photos interests city country intent";

const DEFAULT_DECK_SIZE = 20;

type LeanConversation = {
  _id: Types.ObjectId;
  lastMessage: Types.ObjectId | null;
  lastMessageAt: Date;
};

type LeanMessage = {
  _id: Types.ObjectId;
  senderId: Types.ObjectId;
  message: string;
  messageType: string;
  isDeleted: boolean;
  createdAt: Date;
};

const serverError = (res: Response, error: unknown, context: string): void => {
  console.error(`${context}:`, error);
  res.status(500).json({
    message: error instanceof Error ? error.message : "Server error",
  });
};

/**
 * Ends a connection from both sides: the match goes inactive and both people
 * record a pass, which is what actually keeps them out of each other's decks.
 * Shared by unmatch, block and report-and-block.
 */
const severConnection = async (
  meId: Types.ObjectId,
  otherId: Types.ObjectId | string
): Promise<{ matchId: string | null; conversationId: string | null }> => {
  const [userA, userB] = orderedPair(meId, otherId);

  const match = await Match.findOneAndUpdate(
    { userA, userB, status: "active" },
    { $set: { status: "unmatched", endedBy: meId } },
    { new: true }
  );

  await Like.bulkWrite([
    {
      updateOne: {
        filter: { fromUser: meId, toUser: otherId },
        update: { $set: { action: "pass" } },
        upsert: true,
      },
    },
    {
      updateOne: {
        filter: { fromUser: otherId, toUser: meId },
        update: { $set: { action: "pass" } },
        upsert: true,
      },
    },
  ]);

  return {
    matchId: match ? match._id.toString() : null,
    conversationId: match ? match.conversationId.toString() : null,
  };
};

/** Tells the other side a connection ended, without saying they were blocked. */
const notifyMatchEnded = (
  otherId: Types.ObjectId | string,
  payload: { matchId: string | null; conversationId: string | null; userId: string }
): void => {
  const socketId = getReceiverSocketId(otherId.toString());
  if (socketId) io.to(socketId).emit("match_ended", payload);
};

/* ------------------------------------------------------------------ */
/* Discover                                                            */
/* ------------------------------------------------------------------ */

export const getDiscoverFeed = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const me = (req as any).user as IUser;
    if (!me) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const parsed = discoverQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({
        message: parsed.error.issues[0]?.message ?? "Invalid filters",
        errors: parsed.error.flatten().fieldErrors,
      });
      return;
    }

    const filters = parsed.data;
    const limit = filters.limit ?? DEFAULT_DECK_SIZE;

    // Anyone already decided on, already matched with, or blocked either way.
    const [decisions, likedMe, matches, blockedIds] = await Promise.all([
      Like.find({ fromUser: me._id }).select("toUser").lean(),
      Like.find({ toUser: me._id, action: "like" }).select("fromUser").lean(),
      Match.find({ $or: [{ userA: me._id }, { userB: me._id }] })
        .select("userA userB")
        .lean(),
      blockedIdsFor(me._id),
    ]);

    const excludedIds: Types.ObjectId[] = [
      me._id,
      ...decisions.map((doc) => doc.toUser),
      ...matches.flatMap((match) => [match.userA, match.userB]),
      ...blockedIds,
    ];

    const likerIds = likedMe.map((doc) => doc.fromUser);
    const likerSet = new Set(likerIds.map((id) => id.toString()));

    const query: Record<string, unknown> = {};

    // Age runs as an indexed birth-date range. It is only applied when asked
    // for, so members who have not filled in a birth date are still reachable.
    if (filters.minAge !== undefined || filters.maxAge !== undefined) {
      const minAge = filters.minAge ?? me.ageMin;
      const maxAge = filters.maxAge ?? me.ageMax;
      query.birthDate = birthDateBoundsForAges(minAge, maxAge);
    }

    const genders = gendersForPreference(filters.preference ?? me.preference);
    if (genders) query.gender = { $in: genders };

    // ...and only show this member to people whose own preference includes them.
    const reciprocal = preferencesMatching(me.gender);
    if (reciprocal) query.preference = { $in: reciprocal };

    if (filters.city) {
      query.city = { $regex: `^${escapeRegex(filters.city)}$`, $options: "i" };
    }
    if (filters.country) {
      query.country = {
        $regex: `^${escapeRegex(filters.country)}$`,
        $options: "i",
      };
    }

    const interests = (filters.interests ?? "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);
    if (interests.length) {
      query.interests = {
        $in: interests.map(
          (value) => new RegExp(`^${escapeRegex(value)}$`, "i")
        ),
      };
    }

    // People who already liked this member come first — the ids were fetched
    // anyway to detect matches, so the ordering costs one extra indexed query.
    const priority = likerIds.length
      ? await User.find({ ...query, _id: { $in: likerIds, $nin: excludedIds } })
          .select(PROFILE_FIELDS)
          .sort({ createdAt: -1 })
          .limit(limit)
          .lean()
      : [];

    const remaining = limit - priority.length;

    const rest =
      remaining > 0
        ? await User.find({
            ...query,
            _id: {
              $nin: [...excludedIds, ...priority.map((user) => user._id)],
            },
          })
            .select(PROFILE_FIELDS)
            .sort({ createdAt: -1 })
            .limit(remaining)
            .lean()
        : [];

    const profiles = [...priority, ...rest].map((user) => ({
      ...publicProfile(user),
      likesYou: likerSet.has(user._id.toString()),
    }));

    res.status(200).json({ count: profiles.length, profiles });
  } catch (error: unknown) {
    serverError(res, error, "Discover feed error");
  }
};

/* ------------------------------------------------------------------ */
/* Like / pass                                                         */
/* ------------------------------------------------------------------ */

export const likeProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const me = (req as any).user as IUser;
    if (!me) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { userId: targetId } = req.params;

    if (me._id.toString() === targetId) {
      res.status(400).json({ message: "You cannot like your own profile" });
      return;
    }

    const target = await User.findById(targetId).select(PROFILE_FIELDS).lean();
    if (!target) {
      res.status(404).json({ message: "Profile not found" });
      return;
    }

    if (await isBlockedBetween(me._id, targetId)) {
      res.status(403).json({ message: "This profile is unavailable" });
      return;
    }

    // Upsert, so liking someone previously passed on simply changes the answer.
    await Like.findOneAndUpdate(
      { fromUser: me._id, toUser: targetId },
      { $set: { action: "like" } },
      { upsert: true, new: true }
    );

    const reciprocal = await Like.findOne({
      fromUser: targetId,
      toUser: me._id,
      action: "like",
    }).lean();

    if (!reciprocal) {
      res.status(201).json({ matched: false, message: "Liked" });
      return;
    }

    // Mutual — open the conversation first, the match document points at it.
    const conversation = await findOrCreateDirectConversation(me._id, targetId);
    const [userA, userB] = orderedPair(me._id, targetId);

    const match = await Match.findOneAndUpdate(
      { userA, userB },
      {
        $set: {
          conversationId: conversation._id,
          status: "active",
          endedBy: null,
          matchedAt: new Date(),
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    const matchId = match!._id.toString();
    const conversationId = conversation._id.toString();

    const socketId = getReceiverSocketId(targetId);
    if (socketId) {
      io.to(socketId).emit("new_match", {
        matchId,
        conversationId,
        matchedAt: match!.matchedAt,
        profile: publicProfile(me),
      });
    }

    res.status(201).json({
      matched: true,
      message: "It's a match!",
      matchId,
      conversationId,
      matchedAt: match!.matchedAt,
      profile: publicProfile(target),
    });
  } catch (error: unknown) {
    serverError(res, error, "Like profile error");
  }
};

export const passProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const me = (req as any).user as IUser;
    if (!me) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { userId: targetId } = req.params;

    if (me._id.toString() === targetId) {
      res.status(400).json({ message: "You cannot pass on your own profile" });
      return;
    }

    const exists = await User.exists({ _id: targetId });
    if (!exists) {
      res.status(404).json({ message: "Profile not found" });
      return;
    }

    await Like.findOneAndUpdate(
      { fromUser: me._id, toUser: targetId },
      { $set: { action: "pass" } },
      { upsert: true }
    );

    res.status(200).json({ message: "Passed" });
  } catch (error: unknown) {
    serverError(res, error, "Pass profile error");
  }
};

/* ------------------------------------------------------------------ */
/* Matches                                                             */
/* ------------------------------------------------------------------ */

export const getMatches = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const me = (req as any).user as IUser;
    if (!me) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const myId = me._id.toString();

    const matches = await Match.find({
      $or: [{ userA: me._id }, { userB: me._id }],
      status: "active",
    })
      .sort({ matchedAt: -1 })
      .lean();

    if (!matches.length) {
      res.status(200).json({ count: 0, matches: [] });
      return;
    }

    const otherIds = matches.map((match) =>
      match.userA.toString() === myId ? match.userB : match.userA
    );

    // Resolved by hand rather than with `populate`, so the shapes stay typed.
    const [people, conversations] = await Promise.all([
      User.find({ _id: { $in: otherIds } }).select(PROFILE_FIELDS).lean(),
      Conversation.find({ _id: { $in: matches.map((m) => m.conversationId) } })
        .select("lastMessage lastMessageAt")
        .lean() as unknown as Promise<LeanConversation[]>,
    ]);

    const lastMessageIds = conversations
      .map((conversation) => conversation.lastMessage)
      .filter(Boolean) as Types.ObjectId[];

    const lastMessages = lastMessageIds.length
      ? ((await MessageModel.find({ _id: { $in: lastMessageIds } })
          .select("senderId message messageType isDeleted createdAt")
          .lean()) as unknown as LeanMessage[])
      : [];

    const peopleById = new Map(
      people.map((person) => [person._id.toString(), person])
    );
    const conversationById = new Map(
      conversations.map((conversation) => [
        conversation._id.toString(),
        conversation,
      ])
    );
    const messageById = new Map(
      lastMessages.map((message) => [message._id.toString(), message])
    );

    const payload = matches.flatMap((match) => {
      const otherId =
        match.userA.toString() === myId ? match.userB : match.userA;
      const person = peopleById.get(otherId.toString());
      if (!person) return [];

      const conversation = conversationById.get(match.conversationId.toString());
      const lastMessage = conversation?.lastMessage
        ? messageById.get(conversation.lastMessage.toString())
        : undefined;

      return [
        {
          matchId: match._id.toString(),
          matchedAt: match.matchedAt,
          conversationId: match.conversationId.toString(),
          lastMessageAt: conversation?.lastMessageAt ?? match.matchedAt,
          lastMessage: lastMessage
            ? {
                text: lastMessage.isDeleted
                  ? "This message was deleted"
                  : lastMessage.message,
                messageType: lastMessage.messageType,
                fromMe: lastMessage.senderId.toString() === myId,
                createdAt: lastMessage.createdAt,
              }
            : null,
          profile: publicProfile(person),
        },
      ];
    });

    res.status(200).json({ count: payload.length, matches: payload });
  } catch (error: unknown) {
    serverError(res, error, "Get matches error");
  }
};

export const unmatchUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const me = (req as any).user as IUser;
    if (!me) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { userId: otherId } = req.params;
    const [userA, userB] = orderedPair(me._id, otherId);

    const existing = await Match.findOne({ userA, userB, status: "active" });
    if (!existing) {
      res.status(404).json({ message: "Match not found" });
      return;
    }

    const { matchId, conversationId } = await severConnection(me._id, otherId);

    notifyMatchEnded(otherId, {
      matchId,
      conversationId,
      userId: me._id.toString(),
    });

    res.status(200).json({ message: "Unmatched", matchId });
  } catch (error: unknown) {
    serverError(res, error, "Unmatch error");
  }
};

/* ------------------------------------------------------------------ */
/* Block / report                                                      */
/* ------------------------------------------------------------------ */

export const blockUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const me = (req as any).user as IUser;
    if (!me) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { userId: otherId } = req.params;

    if (me._id.toString() === otherId) {
      res.status(400).json({ message: "You cannot block yourself" });
      return;
    }

    const exists = await User.exists({ _id: otherId });
    if (!exists) {
      res.status(404).json({ message: "Profile not found" });
      return;
    }

    await User.updateOne(
      { _id: me._id },
      { $addToSet: { blockedUsers: new Types.ObjectId(otherId) } }
    );

    const { matchId, conversationId } = await severConnection(me._id, otherId);

    // Deliberately the same event as an unmatch — being blocked is not announced.
    notifyMatchEnded(otherId, {
      matchId,
      conversationId,
      userId: me._id.toString(),
    });

    res.status(200).json({ message: "Blocked" });
  } catch (error: unknown) {
    serverError(res, error, "Block user error");
  }
};

export const unblockUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const me = (req as any).user as IUser;
    if (!me) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { userId: otherId } = req.params;

    await User.updateOne(
      { _id: me._id },
      { $pull: { blockedUsers: new Types.ObjectId(otherId) } }
    );

    res.status(200).json({ message: "Unblocked" });
  } catch (error: unknown) {
    serverError(res, error, "Unblock user error");
  }
};

export const getBlockedUsers = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const me = (req as any).user as IUser;
    if (!me) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const people = await User.find({ _id: { $in: me.blockedUsers ?? [] } })
      .select(PROFILE_FIELDS)
      .lean();

    res.status(200).json({
      count: people.length,
      blocked: people.map((person) => publicProfile(person)),
    });
  } catch (error: unknown) {
    serverError(res, error, "Get blocked users error");
  }
};

export const reportUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const me = (req as any).user as IUser;
    if (!me) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { userId: otherId } = req.params;

    if (me._id.toString() === otherId) {
      res.status(400).json({ message: "You cannot report yourself" });
      return;
    }

    const parsed = reportSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        message: parsed.error.issues[0]?.message ?? "Invalid report",
        errors: parsed.error.flatten().fieldErrors,
      });
      return;
    }

    const exists = await User.exists({ _id: otherId });
    if (!exists) {
      res.status(404).json({ message: "Profile not found" });
      return;
    }

    await Report.create({
      reporterId: me._id,
      reportedId: otherId,
      reason: parsed.data.reason,
      details: parsed.data.details ?? "",
    });

    if (parsed.data.block) {
      await User.updateOne(
        { _id: me._id },
        { $addToSet: { blockedUsers: new Types.ObjectId(otherId) } }
      );

      const { matchId, conversationId } = await severConnection(me._id, otherId);

      notifyMatchEnded(otherId, {
        matchId,
        conversationId,
        userId: me._id.toString(),
      });
    }

    res.status(201).json({
      message: parsed.data.block
        ? "Reported and blocked"
        : "Report submitted",
      blocked: Boolean(parsed.data.block),
    });
  } catch (error: unknown) {
    serverError(res, error, "Report user error");
  }
};
