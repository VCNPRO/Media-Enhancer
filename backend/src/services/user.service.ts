import { query } from './database.service';

export interface User {
  id: string;
  clerk_user_id: string;
  email: string;
  username?: string;
  avatar_url?: string;
  created_at: Date;
  updated_at: Date;
}

export interface UserSubscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: string;
  current_period_start?: Date;
  current_period_end?: Date;
}

/**
 * Create a new user in the database
 */
export const createUser = async (clerkUserId: string, email: string, username?: string, avatarUrl?: string): Promise<User> => {
  const result = await query(
    `INSERT INTO users (clerk_user_id, email, username, avatar_url)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [clerkUserId, email, username, avatarUrl]
  );
  return result.rows[0];
};

/**
 * Get user by Clerk user ID
 */
export const getUserByClerkId = async (clerkUserId: string): Promise<User | null> => {
  const result = await query(
    'SELECT * FROM users WHERE clerk_user_id = $1',
    [clerkUserId]
  );
  return result.rows[0] || null;
};

/**
 * Get user by internal ID
 */
export const getUserById = async (userId: string): Promise<User | null> => {
  const result = await query(
    'SELECT * FROM users WHERE id = $1',
    [userId]
  );
  return result.rows[0] || null;
};

/**
 * Update user information
 */
export const updateUser = async (
  clerkUserId: string,
  updates: { email?: string; username?: string; avatar_url?: string }
): Promise<User | null> => {
  const setClauses: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  if (updates.email !== undefined) {
    setClauses.push(`email = $${paramIndex++}`);
    values.push(updates.email);
  }
  if (updates.username !== undefined) {
    setClauses.push(`username = $${paramIndex++}`);
    values.push(updates.username);
  }
  if (updates.avatar_url !== undefined) {
    setClauses.push(`avatar_url = $${paramIndex++}`);
    values.push(updates.avatar_url);
  }

  if (setClauses.length === 0) {
    return getUserByClerkId(clerkUserId);
  }

  setClauses.push(`updated_at = CURRENT_TIMESTAMP`);
  values.push(clerkUserId);

  const result = await query(
    `UPDATE users SET ${setClauses.join(', ')}
     WHERE clerk_user_id = $${paramIndex}
     RETURNING *`,
    values
  );
  return result.rows[0] || null;
};

/**
 * Delete user
 */
export const deleteUser = async (clerkUserId: string): Promise<boolean> => {
  const result = await query(
    'DELETE FROM users WHERE clerk_user_id = $1',
    [clerkUserId]
  );
  return (result.rowCount ?? 0) > 0;
};

/**
 * Get or create user (upsert)
 */
export const getOrCreateUser = async (
  clerkUserId: string,
  email: string,
  username?: string,
  avatarUrl?: string
): Promise<User> => {
  let user = await getUserByClerkId(clerkUserId);
  if (!user) {
    user = await createUser(clerkUserId, email, username, avatarUrl);

    // Create default starter subscription
    await query(
      `INSERT INTO user_subscriptions (user_id, plan_id, status)
       VALUES ($1, 'starter', 'active')`,
      [user.id]
    );
  }
  return user;
};

/**
 * Get user's subscription
 */
export const getUserSubscription = async (userId: string): Promise<UserSubscription | null> => {
  const result = await query(
    `SELECT * FROM user_subscriptions
     WHERE user_id = $1 AND status = 'active'
     ORDER BY created_at DESC
     LIMIT 1`,
    [userId]
  );
  return result.rows[0] || null;
};

/**
 * Get user's usage stats
 */
export const getUserUsageStats = async (userId: string) => {
  // Get total storage used
  const storageResult = await query(
    'SELECT COALESCE(SUM(file_size), 0) as total_storage FROM media_files WHERE user_id = $1',
    [userId]
  );

  // Get project count
  const projectsResult = await query(
    'SELECT COUNT(*) as total_projects FROM projects WHERE user_id = $1',
    [userId]
  );

  // Get exports this month
  const exportsResult = await query(
    `SELECT COUNT(*) as total_exports FROM exports
     WHERE user_id = $1 AND created_at >= date_trunc('month', CURRENT_DATE)`,
    [userId]
  );

  return {
    storage_used: parseInt(storageResult.rows[0].total_storage),
    projects_count: parseInt(projectsResult.rows[0].total_projects),
    exports_this_month: parseInt(exportsResult.rows[0].total_exports),
  };
};
