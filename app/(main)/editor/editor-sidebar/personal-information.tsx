"use client";

import { cn } from "@/lib/utils";
import { Section } from "@/components/custom/form/form-section";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { useFormContext } from "react-hook-form";
import type { CvData } from "@/schemas/cv_data_schema";
import { DatePickerInput } from "@/components/ui/date-picker";
import { FieldLabel } from "@/components/custom/form/field-label";
import ImagePicker from "@/components/custom/form/ImagePicker";
import { useState } from "react";

export function PersonalInformationTab({
  className,
  userId,
  cvId,
}: {
  className?: string;
  userId: string;
  cvId: string;
}) {
  const [pictureUrl, setPictureUrl] = useState<string | null>(null);
  const form = useFormContext<CvData>();

  const NameField = () => {
    return (
      <FormField
        control={form.control}
        name="personalInformation.name"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <Input id="firstName" type="text" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    );
  };

  return (
    <Section className={cn("p-4", className)}>
      <div className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg border">
        <div className="flex flex-col items-center space-y-1">
          <ImagePicker
            uid={userId + cvId}
            url={form.getValues("personalInformation.profileUrl") ?? ""}
            size={100}
            bucket="cv_picture"
            title="Picture"
            onUpload={(url: string) =>
              form.setValue("personalInformation.profileUrl", url)
            }
          />
        </div>
        <div className="flex-1">
          <h4 className="font-medium text-foreground text-sm">
            Profile Picture
          </h4>
          <p className="text-xs text-muted-foreground mt-1">
            Click to change • JPG, PNG, GIF • Max 5MB
          </p>
        </div>
      </div>

      <br />

      <div className="grid items-start gap-x-4 gap-y-4 sm:grid-cols-[max-content_minmax(0,1fr)]">
        {/* Title */}
        <FieldLabel htmlFor="professionalTitle">Title</FieldLabel>
        <FormField
          control={form.control}
          name="personalInformation.professionalTitle"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input id="professionalTitle" type="text" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* First Name */}
        <FieldLabel htmlFor="firstName">First Name</FieldLabel>
        <FormField
          control={form.control}
          name="personalInformation.name"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input id="firstName" type="text" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Last Name */}
        <FieldLabel htmlFor="lastName">Last Name</FieldLabel>
        <FormField
          control={form.control}
          name="personalInformation.surname"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input id="lastName" type="text" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FieldLabel htmlFor="birthdate">Birthdate</FieldLabel>
        <FormField
          control={form.control}
          name="personalInformation.birthdate"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <DatePickerInput
                  value={field.value ? new Date(field.value) : null}
                  onChange={(d) => {
                    field.onChange(d);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Summary */}
        <FieldLabel htmlFor="summary">Summary</FieldLabel>
        <FormField
          control={form.control}
          name="personalInformation.summary"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea
                  id="summary"
                  placeholder="e.g., Proactive Marketing Manager…"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Email */}
        <FieldLabel htmlFor="email">Email</FieldLabel>
        <FormField
          control={form.control}
          name="personalInformation.email"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input id="email" type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Phone */}
        <FieldLabel htmlFor="phone">Phone</FieldLabel>
        <FormField
          control={form.control}
          name="personalInformation.phone"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input id="phone" type="tel" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Location */}
        <FieldLabel htmlFor="location">Location</FieldLabel>
        <FormField
          control={form.control}
          name="personalInformation.location"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input id="location" type="text" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Xing */}
        <FieldLabel htmlFor="xing">Xing</FieldLabel>
        <FormField
          control={form.control}
          name="personalInformation.xing"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  id="xing"
                  type="url"
                  placeholder="https://xing.com/…"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* LinkedIn */}
        <FieldLabel htmlFor="linkedin">LinkedIn</FieldLabel>
        <FormField
          control={form.control}
          name="personalInformation.linkedin"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  id="linkedin"
                  type="url"
                  placeholder="https://linkedin.com/…"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Website */}
        <FieldLabel htmlFor="website">Website</FieldLabel>
        <FormField
          control={form.control}
          name="personalInformation.website"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  id="website"
                  type="url"
                  placeholder="https://…"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </Section>
  );
}
