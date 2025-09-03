'use server'

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { z } from 'zod';

const schema = z.object({
  email: z.email({
    message: "E-Mail is invalid!"
  }),
  password: z
    .string()
    .min(6, "Password must be at least 8 characters")
    .max(100, "Password must be less than 100 characters"),
});

export async function login(formData: FormData) {
  const supabase = await createClient();

  const validatedFields = schema.safeParse({
    email: formData.get('email'),
    password: formData.get('password')
  });

  if(!validatedFields.success){
    return { 
      zodErrors: validatedFields.error.flatten().fieldErrors,
      message: "Invalid Fields. Failed to login."
    }
  }

  const { error } = await supabase.auth.signInWithPassword(validatedFields.data);

  if (error) {
    console.log(error);
    redirect('/error');
  }

  revalidatePath('/', 'layout');
  redirect('/');
}
