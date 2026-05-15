export interface CreateGroupBody {
  name: string;
  description?: string;
  memberIds: string[];
}

export interface AddMembersBody {
  memberIds: string[];
}

export interface PaginationQuery {
  page?: string;
  limit?: string;
}