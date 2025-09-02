'use server'

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';

export async function forgotPassword(formData: FormData) {
  const supabase = await createClient()

  // type-casting here for convenience
  // TODO: validate your inputs
  const email = formData.get('email') as string;
  

  const { error } = await supabase.auth.resetPasswordForEmail(email);

  if (error) {
    console.log(error);
    redirect('/error');
  }

  revalidatePath('/', 'layout');
  redirect('/');
}