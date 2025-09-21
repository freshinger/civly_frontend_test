"use client";
import { EditorSidebarRight } from "@/app/(main)/editor/editor-sidebar/editor-sidebar-right";
import { useParams } from "next/navigation";
import { TemplatePreview } from "./TemplatePreview";
import { EditorHeader } from "../editor-sidebar/editor-header";
import { useState } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

export default function Page() {
  const { id } = useParams() as { id: string };
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);

  return (
    <div
      className="grid h-screen w-full max-w-full overflow-hidden"
      style={{
        gridTemplateColumns: rightSidebarOpen ? "1fr 400px" : "1fr 0px",
      }}
    >
      <div className="flex flex-col overflow-hidden min-w-0 bg-red-100">
        <div className="flex-shrink-0">
          <EditorHeader
            cvId={id}
            rightSidebarOpen={rightSidebarOpen}
            setRightSidebarOpen={setRightSidebarOpen}
          />
        </div>
        <div className="flex flex-col w-full h-full bg-blue-100">
          <TransformWrapper
            initialScale={1}
            initialPositionX={0}
            initialPositionY={100}
            minScale={0.5}
            maxScale={4}
            limitToBounds={false}
            wheel={{
              disabled: false,
              step: 0.1,
              smoothStep: 0.01,
              touchPadDisabled: false,
            }}
            pinch={{ disabled: false, step: 0.1 }}
          >
            <TransformComponent
              wrapperStyle={{
                width: "100%",
                height: "100%",
              }}
              contentStyle={{ width: "100%", height: "100%" }}
            >
              <div className="w-full h-[100%]">
                <TemplatePreview id={id} />
              </div>
            </TransformComponent>
          </TransformWrapper>
        </div>
      </div>
      <div
        className={`transition-all duration-300 ${
          rightSidebarOpen ? "" : "hidden lg:hidden"
        } lg:block overflow-hidden`}
      >
        <div className="w-full h-full">
          <EditorSidebarRight id={id} />
        </div>
      </div>
    </div>
  );
}
