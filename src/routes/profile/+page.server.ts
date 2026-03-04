import { redirect, fail } from "@sveltejs/kit";
import type { PageServerLoad, Actions } from "./$types";
import { db } from "$lib/db";
import { users } from "$lib/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";

export const load: PageServerLoad = async (event) => {
  const session = await event.locals.auth();

  if (!session?.user) {
    throw redirect(303, "/login");
  }

  const user = await db.query.users.findFirst({
    where: eq(users.email, session.user.email!),
  });

  return {
    user: {
      name: user?.name ?? "",
      email: user?.email ?? "",
      image: user?.image ?? "",
      hasPassword: !!user?.password,
      createdAt: user?.createdAt?.toISOString() ?? "",
    },
  };
};

export const actions: Actions = {
  update: async ({ request, locals }) => {
    const session = await locals.auth();

    if (!session?.user) {
      throw redirect(303, "/login");
    }

    const form = await request.formData();
    const name = form.get("name") as string;
    const email = form.get("email") as string;
    const currentPassword = form.get("currentPassword") as string;
    const newPassword = form.get("newPassword") as string;

    if (!email) {
      return fail(400, { error: "Email is required." });
    }

    try {
      const user = await db.query.users.findFirst({
        where: eq(users.email, session.user.email!),
      });

      if (!user) {
        return fail(404, { error: "User not found." });
      }

      const updateData: Record<string, any> = { name, email };

      // Handle password change
      if (newPassword) {
        if (newPassword.length < 6) {
          return fail(400, { error: "New password must be at least 6 characters." });
        }

        // If user has an existing password, require current password
        if (user.password) {
          if (!currentPassword) {
            return fail(400, { error: "Current password is required to set a new password." });
          }
          const valid = await bcrypt.compare(currentPassword, user.password);
          if (!valid) {
            return fail(400, { error: "Current password is incorrect." });
          }
        }

        updateData.password = await bcrypt.hash(newPassword, 12);
      }

      // Check if new email is already taken by another user
      if (email !== session.user.email) {
        const existing = await db.query.users.findFirst({
          where: eq(users.email, email),
        });
        if (existing) {
          return fail(400, { error: "This email is already in use." });
        }
      }

      await db
        .update(users)
        .set(updateData)
        .where(eq(users.email, session.user.email!));

      return { success: true };
    } catch (err) {
      console.error("Profile update error:", err);
      return fail(500, { error: "Failed to update profile." });
    }
  },
};
