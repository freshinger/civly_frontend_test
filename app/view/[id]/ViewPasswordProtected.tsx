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
    const [response, setResponse] = React.useState("Please enter the Passcode");
    const [showPasswordField, setShowPasswordField] = React.useState(true);

    async function sendPassword(){
        const data = await supabase.functions.invoke('restful-api/view', {
        method: 'POST',
        body: {id, password}
        });
        if(data.response?.status !== 200){
            if(data.response?.status == 403){
                setResponse('Access Forbidden');
            } else if(data.response?.status == 429){
                setResponse('Access Forbidden. Too many retries.');
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
        <div className="flex justify-center">
            <div className="flex flex-col justify-evenly h-48">
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
            </div>
        </div>
        )
    } else {
        return (
        <>
        <pre>{response}</pre>
        </>
        )
    }
}