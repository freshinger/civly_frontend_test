'use client'
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from "@/components/ui/input-otp";
import { createClient } from "@/utils/supabase/client";
import React from "react";

export default function Page({
  id
}: { id:string }) {
    const supabase = createClient();

    const [password, setPassword] = React.useState("");
    const [response, setResponse] = React.useState("");
    const [showPasswordField, setShowPasswordField] = React.useState(true);

    async function sendPassword(){
        const data = await supabase.functions.invoke('restful-api/view', {
        method: 'POST',
        body: {id, password}
        });
        if(data.response?.status !== 200){
            if(data.response?.status == 403){
                setResponse('Access Forbidden');
            } else {
                setResponse(JSON.stringify(data.error));
            }
        } else {
            setResponse(JSON.stringify(data.data));
            setShowPasswordField(false);
        }
    }

    if(showPasswordField){
        return (
        <>
        <pre>{response}</pre>
        <InputOTP 
        maxLength={6}
        value={password}
        onChange={(password) => setPassword(password)}
        >
        <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
        </InputOTPGroup>
        <InputOTPSeparator />
        <InputOTPGroup>
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
        </InputOTPGroup>
        </InputOTP>
        <Button onClick={sendPassword}>Send</Button>
        </>
        )
    } else {
        return (
        <>
        <pre>{response}</pre>
        </>
        )
    }
}