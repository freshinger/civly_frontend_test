import * as React from "react"

import Image, { ImageProps } from "next/image"

type CivlyLogoProps = Omit<ImageProps, "src" | "alt">

export function CivlyLogo({ height, width, ...props }: CivlyLogoProps) {
    return (
      <Image
        className="h-8 w-auto"
        src="/civly_logo.png"
        alt="Civly Logo"
        width={width}
        height={height}
        {...props}
      />
    )
  }
