"use client";

import React from "react";
import {
  UserPlus,
  UserCheck,
  Clock3,
} from "lucide-react";

import toast from "react-hot-toast";

import { useUserProfile } from "@/hooks/useUserProfile";
import { useFollowUser } from "@/hooks/useFollowUser";
import { useCancelFollowRequest } from "@/hooks/useCancelFollowRequest";
import { useUnfollowUser } from "@/hooks/useUnfollowUser";

type FollowStatus =
  | "follow"
  | "following"
  | "requested"
  | "followBack";

const FriendsPage = () => {
  const { data, isLoading, error } =
    useUserProfile();

  const followMutation = useFollowUser();

  const cancelMutation =
    useCancelFollowRequest();

  const unfollowMutation =
    useUnfollowUser();

  const handleFollow = async (
    userId: string
  ) => {
    try {
      const response =
        await followMutation.mutateAsync(userId);

      toast.success(
        response?.message ||
          "Follow request sent"
      );
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          "Failed to follow user"
      );
    }
  };

  const handleCancel = async (
    userId: string
  ) => {
    try {
      const response =
        await cancelMutation.mutateAsync(userId);

      toast.success(
        response?.message ||
          "Follow request cancelled"
      );
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          "Failed to cancel request"
      );
    }
  };

  const handleUnfollow = async (
    userId: string
  ) => {
    try {
      const response =
        await unfollowMutation.mutateAsync(userId);

      toast.success(
        response?.message ||
          "Unfollowed successfully"
      );
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          "Failed to unfollow"
      );
    }
  };

  const renderButton = (
    status: FollowStatus,
    userId: string
  ) => {
    switch (status) {
      case "follow":
        return (
          <button
            onClick={() =>
              handleFollow(userId)
            }
            disabled={
              followMutation.isPending
            }
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <UserPlus size={16} />

            {followMutation.isPending
              ? "Loading..."
              : "Follow"}
          </button>
        );

      case "followBack":
        return (
          <button
            onClick={() =>
              handleFollow(userId)
            }
            disabled={
              followMutation.isPending
            }
            className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <UserPlus size={16} />

            {followMutation.isPending
              ? "Loading..."
              : "Follow Back"}
          </button>
        );

      case "following":
        return (
          <button
            onClick={() =>
              handleUnfollow(userId)
            }
            disabled={
              unfollowMutation.isPending
            }
            className="flex items-center gap-2 rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-800 transition hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <UserCheck size={16} />

            {unfollowMutation.isPending
              ? "Loading..."
              : "Following"}
          </button>
        );

      case "requested":
        return (
          <button
            onClick={() =>
              handleCancel(userId)
            }
            disabled={
              cancelMutation.isPending
            }
            className="flex items-center gap-2 rounded-lg bg-yellow-100 px-4 py-2 text-sm font-medium text-yellow-700 transition hover:bg-yellow-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Clock3 size={16} />

            {cancelMutation.isPending
              ? "Loading..."
              : "Requested"}
          </button>
        );

      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <p className="p-6 text-gray-500">
        Loading...
      </p>
    );
  }

  if (error) {
    return (
      <p className="p-6 text-red-500">
        Something went wrong
      </p>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            People You May Know
          </h1>

          <p className="mt-1 text-gray-500">
            Connect with other users
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {data?.map((user) => (
            <div
              key={user._id}
              className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-lg font-bold text-blue-600">
                    {user.name
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {user.name}
                    </h2>

                    <p className="text-sm text-gray-500">
                      {user.email}
                    </p>
                  </div>
                </div>

                <div>
                  {renderButton(
                    user.followStatus as FollowStatus,
                    user._id
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FriendsPage;