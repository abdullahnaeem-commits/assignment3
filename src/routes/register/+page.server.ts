import { db } from "$lib/db";
import { users } from "$lib/schema";
import bcrypt from "bcrypt";
import { fail, redirect } from "@sveltejs/kit";
import type { Actions } from "./$types";

export const actions: Actions = {
  default: async ({ request }) => {
    const form = await request.formData();
    const name = form.get("name") as string;
    const email = form.get("email") as string;
    const password = form.get("password") as string;

    if (!email || !password) {
      return fail(400, { error: "Email and password are required." });
    }

    if (password.length < 6) {
      return fail(400, { error: "Password must be at least 6 characters." });
    }

    try {
      const hashed = await bcrypt.hash(password, 12);

      await db.insert(users).values({
        name,
        email,
        password: hashed,
      });

      throw redirect(303, "/login?registered=true");
    } catch (err: any) {
      if (err?.status === 303) throw err;

      console.error("Registration error:", err);

      if (err?.code === "23505") {
        return fail(400, { error: "An account with this email already exists." });
      }

      return fail(500, { error: "Registration failed. Please try again." });
    }
  },
};
