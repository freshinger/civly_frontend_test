'use server'

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { z } from 'zod';

const schema = z.object({
  email: z.email({
    message: "E-Mail is invalid!"
  })
});

export async function forgotPassword(formData: FormData) {
  const supabase = await createClient()

  const validatedFields = schema.safeParse({
    email: formData.get('email')
  });

  if(!validatedFields.success){
    return { 
      zodErrors: validatedFields.error.flatten().fieldErrors,
      message: "Invalid Field. Failed to reset Password."
    }
  }

  const { error } = await supabase.auth.resetPasswordForEmail(validatedFields.data.email);

  if (error) {
    console.log(error);
    redirect('/error');
  }

  revalidatePath('/', 'layout');
  redirect('/');
}