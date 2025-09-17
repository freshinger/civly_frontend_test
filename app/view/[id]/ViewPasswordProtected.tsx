"use client";
import { ShowCVByTemplate } from "@/components/custom/cv-view/ShowCVByTemplate";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "@/components/ui/input-otp";
import { createClient } from "@/utils/supabase/client";
import React from "react";

export default function Page({ id }: { id: string }) {
  const supabase = createClient();

  const [cvData, setCvData] = React.useState(null);
  const [password, setPassword] = React.useState("");
  const [disableButton, setDisableButton] = React.useState(false);
  const [response, setResponse] = React.useState("Please enter the Passcode");
  const [showPasswordField, setShowPasswordField] = React.useState(true);

  async function sendPassword() {
    setDisableButton(true);
    setResponse("Loading...");
    const data = await supabase.functions.invoke("view", {
      method: "POST",
      body: { id, password },
    });
    if (data.response?.status !== 200) {
      if (data.response?.status == 403) {
        setResponse("Access forbidden");
        setDisableButton(false);
      } else if (data.response?.status == 429) {
        setResponse("Access temporary locked.");
      } else {
        setResponse(JSON.stringify(data.error));
        setDisableButton(false);
      }
    } else {
      console.log(data.data);
      setCvData(data.data);
      setShowPasswordField(false);
    }
  }

  if (showPasswordField) {
    return (
      <div>
        <div className="flex justify-center">
          <div className="flex flex-col justify-evenly h-20">
            <pre>{response}</pre>
          </div>
        </div>
        <div className="flex justify-center">
          <div className="flex flex-col justify-evenly h-10">
            <InputOTP
              maxLength={6}
              value={password}
              onChange={(password: string) => setPassword(password)}
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
          </div>
        </div>
        <div className="flex justify-center">
          <div className="flex flex-col justify-evenly h-20">
            <Button disabled={disableButton} onClick={sendPassword}>
              Send
            </Button>
          </div>
        </div>
      </div>
    );
  } else {
    if (cvData !== null) {
      return <ShowCVByTemplate cvData={cvData} />;
    }
  }
}
