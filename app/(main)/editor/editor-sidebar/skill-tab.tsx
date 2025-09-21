"use client";

import * as React from "react";
import { Fragment, useState } from "react";
import { useFormContext, useFieldArray } from "react-hook-form";
import type { CvData } from "@/schemas/cv_data_schema";

import { cn } from "@/lib/utils";
import { Section } from "@/components/custom/form/form-section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  CheckIcon,
  ChevronDown,
  ChevronUp,
  TrashIcon,
  XIcon,
} from "lucide-react";

export function SkillsTab({ className }: { className?: string }) {
  const form = useFormContext<CvData>();

  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: "skillGroups",
  });

  return (
    <div className={cn("flex flex-col gap p-4", className)}>
      {fields.map((f, groupIndex) => (
        <Fragment key={f.id}>
          <SkillGroupRow
            groupIndex={groupIndex}
            totalGroups={fields.length}
            onDeleteGroup={() => remove(groupIndex)}
            onMoveGroupUp={() =>
              groupIndex > 0 && move(groupIndex, groupIndex - 1)
            }
            onMoveGroupDown={() =>
              groupIndex < fields.length - 1 && move(groupIndex, groupIndex + 1)
            }
          />
          {groupIndex < fields.length - 1 && <Separator className="my-4" />}
        </Fragment>
      ))}

      <Button
        type="button"
        variant="outline"
        className="border-primary text-primary dark:border-primary-foreground dark:text-primary-foreground hover:bg-primary hover:text-primary-foreground p-8 mt-8 mb-8 cursor-pointer"
        onClick={() =>
          append({
            name: "",
            skills: [],
            order: 0,
          })
        }
      >
        Add Skill Group
      </Button>
    </div>
  );
}

function SkillGroupRow({
  groupIndex,
  totalGroups,
  onDeleteGroup,
  onMoveGroupUp,
  onMoveGroupDown,
  className,
}: {
  groupIndex: number;
  totalGroups: number;
  onDeleteGroup: () => void;
  onMoveGroupUp: () => void;
  onMoveGroupDown: () => void;
  className?: string;
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const form = useFormContext<CvData>();

  const id = (k: string) => `skillGroup-${groupIndex}-${k}`;

  // nested skills for this group
  const {
    fields: skillFields,
    append: appendSkill,
    remove: removeSkill,
    move: moveSkill,
  } = useFieldArray({
    control: form.control,
    name: `skillGroups.${groupIndex}.skills`,
  });

  return (
    <Section className={cn("bg-card gap-2", className)}>
      <div
        className="flex w-full justify-between"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Group index / move controls */}
        <div className="flex flex-col gap-0 h-9 w-8 items-center justify-center mr-1">
          {isHovered ? (
            <>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={groupIndex === 0}
                className="cursor-pointer h-4 w-8"
                onClick={onMoveGroupUp}
              >
                <ChevronUp className="h-3 w-3" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={groupIndex === totalGroups - 1}
                className="cursor-pointer h-4 w-8"
                onClick={onMoveGroupDown}
              >
                <ChevronDown className="h-3 w-3" />
              </Button>
            </>
          ) : (
            <span className="text-md text-muted-foreground text-center">
              {groupIndex + 1}
            </span>
          )}
        </div>

        {/* Group name */}
        <h3 className="text-lg font-semibold text-primary flex-1">
          <FormField
            control={form.control}
            name={`skillGroups.${groupIndex}.name`}
            render={({ field }) => (
              <FormItem>
                <div className="flex w-full">
                  <FormControl>
                    <Input
                      id={id("name")}
                      placeholder="New Skill Group"
                      {...field}
                    />
                  </FormControl>
                  {/* Delete group confirm */}
                  {isHovered && (
                    <>
                      {isDeleting ? (
                        <div className="flex flex-row gap-2 ml-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="text-red-500 hover:bg-red-100 cursor-pointer hover:text-red-500"
                            onClick={onDeleteGroup}
                          >
                            <CheckIcon className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="cursor-pointer"
                            onClick={() => setIsDeleting(false)}
                          >
                            <XIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="text-red-500 hover:bg-red-100 cursor-pointer hover:text-red-500 ml-1"
                          onClick={() => setIsDeleting(true)}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      )}
                    </>
                  )}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </h3>
      </div>

      {/* Skills of this group */}
      <div className="flex flex-col gap-2 pl-9">
        {skillFields.map((sf, skillIndex) => (
          <SkillRow
            key={sf.id}
            groupIndex={groupIndex}
            skillIndex={skillIndex}
            totalSkills={skillFields.length}
            onMoveUp={() =>
              skillIndex > 0 && moveSkill(skillIndex, skillIndex - 1)
            }
            onMoveDown={() =>
              skillIndex < skillFields.length - 1 &&
              moveSkill(skillIndex, skillIndex + 1)
            }
            onDelete={() => removeSkill(skillIndex)}
          />
        ))}

        <Button
          type="button"
          variant="outline"
          className="text-primary border-primary dark:border-primary-foreground cursor-pointer ml-9"
          onClick={() =>
            appendSkill({
              name: "",
              order: 0,
            })
          }
        >
          Add Skill
        </Button>
      </div>
    </Section>
  );
}

function SkillRow({
  groupIndex,
  skillIndex,
  totalSkills,
  onMoveUp,
  onMoveDown,
  onDelete,
}: {
  groupIndex: number;
  skillIndex: number;
  totalSkills: number;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
}) {
  const form = useFormContext<CvData>();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="flex flex-row gap-1"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Skill index / move controls */}
      <div className="flex flex-col gap-0 h-9 w-8 items-center justify-center mr-1">
        {isHovered ? (
          <>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={skillIndex === 0}
              className="cursor-pointer h-4 w-8"
              onClick={onMoveUp}
            >
              <ChevronUp className="h-3 w-3" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={skillIndex === totalSkills - 1}
              className="cursor-pointer h-4 w-8"
              onClick={onMoveDown}
            >
              <ChevronDown className="h-3 w-3" />
            </Button>
          </>
        ) : (
          <span className="text-md text-muted-foreground w-8 text-center">
            {skillIndex + 1}
          </span>
        )}
      </div>

      {/* Skill name */}
      <FormField
        control={form.control}
        name={`skillGroups.${groupIndex}.skills.${skillIndex}.name`}
        render={({ field }) => (
          <FormItem className="flex w-full flex-col">
            <FormControl>
              <div className="flex w-full">
                <Input
                  className="flex w-full"
                  id={`skill-${groupIndex}-${skillIndex}`}
                  placeholder="New Skill"
                  {...field}
                />
                {/* Delete skill */}
                {isHovered && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-red-500 hover:bg-red-100 cursor-pointer hover:text-red-500"
                    onClick={onDelete}
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </FormControl>

            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
