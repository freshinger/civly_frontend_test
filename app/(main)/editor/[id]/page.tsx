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
      {/* LEFT COLUMN */}
      <div className="flex flex-col overflow-hidden min-w-0">
        <div className="flex-shrink-0">
          <EditorHeader
            cvId={id}
            rightSidebarOpen={rightSidebarOpen}
            setRightSidebarOpen={setRightSidebarOpen}
          />
        </div>

        {/* FILL THE REST */}
        <div className="flex-1 min-h-0 w-full bg-blue-100">
          <TransformWrapper
            initialScale={1}
            minScale={0.5}
            maxScale={4}
            limitToBounds={false}
            centerOnInit
            wheel={{ disabled: false, step: 0.15 }} // <-- remove smoothStep
            pinch={{ disabled: false, step: 0.15 }}
            panning={{ disabled: false }}
          >
            <TransformComponent
              wrapperStyle={{ width: "100%", height: "100%" }}
              contentStyle={{ width: "100%", height: "100%" }}
            >
              {/* Give the content real height so zoom has something to scale */}
              <div className="w-full h-full grid place-items-center">
                {/* If TemplatePreview sizes itself, keep as-is; 
                   otherwise wrap it with a fixed canvas size */}
                <div className="inline-block">
                  <TemplatePreview id={id} />
                </div>
              </div>
            </TransformComponent>
          </TransformWrapper>
        </div>
      </div>

      {/* RIGHT SIDEBAR */}
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
