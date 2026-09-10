import type { ComplexImageType, ImageType } from "@yext/pages-components";
import {
  getDefaultRTF,
  type StyledButtonValue,
  type StyledTextValue,
  type TranslatableAssetImage,
  type TranslatableRichText,
  type TranslatableString,
  type YextEntityField,
} from "@yext/visual-editor";
import type { CSSProperties, ReactNode } from "react";

export const casualDiningThemeVars: CSSProperties = {
  ["--COLOR-BG" as string]: "var(--palette-tertiary)",
  ["--COLOR-BG-ACCENT" as string]: "var(--palette-tertiary)",
  ["--COLOR-TEXT" as string]: "var(--palette-quaternary)",
  ["--COLOR-BORDER" as string]: "var(--palette-tertiary)",
  ["--COLOR-ACCENT" as string]: "var(--palette-secondary)",
  ["--COLOR-ACCENT-HOVER" as string]: "var(--palette-primary)",
  ["--BTN-PRIMARY-BG" as string]: "var(--palette-primary)",
  ["--BTN-SECONDARY-TEXT" as string]: "var(--palette-quaternary)",
  ["--footer-bg" as string]: "var(--palette-quaternary)",
};

export const CapturedStyleRoot = ({
  children,
  style,
  styles,
}: {
  children: ReactNode;
  style?: CSSProperties;
  styles: string;
}) => (
  <div style={style ?? casualDiningThemeVars}>
    <style>{styles}</style>
    {children}
  </div>
);

export const defaultTextStyles: StyledTextValue = {
  fontFamily: "default",
  fontSize: "default",
  fontWeight: "default",
  fontStyle: "default",
  textTransform: "default",
};

export const defaultButtonStyles: StyledButtonValue = {
  ...defaultTextStyles,
  borderRadius: "default",
  letterSpacing: "default",
};

export const aspectRatioOptions: Array<{ label: string; value: number }> = [
  { label: "1:1", value: 1 },
  { label: "5:4", value: 1.25 },
  { label: "4:3", value: 1.33 },
  { label: "3:2", value: 1.5 },
  { label: "5:3", value: 1.67 },
  { label: "16:9", value: 1.78 },
  { label: "2:1", value: 2 },
  { label: "3:1", value: 3 },
  { label: "4:1", value: 4 },
  { label: "4:5", value: 0.8 },
  { label: "3:4", value: 0.75 },
  { label: "2:3", value: 0.67 },
  { label: "3:5", value: 0.6 },
];

export const createTranslatableString = (
  value: string,
): TranslatableString => ({
  defaultValue: value,
  hasLocalizedValue: "true",
});

export const createTextField = (
  value: string,
  field = "",
  constantValueEnabled = field.length === 0,
): YextEntityField<TranslatableString> => ({
  field,
  constantValue: createTranslatableString(value),
  constantValueEnabled,
});

export const createRtfField = (
  value: string,
  field = "",
  constantValueEnabled = field.length === 0,
): YextEntityField<TranslatableRichText> => ({
  field,
  constantValue: {
    defaultValue: getDefaultRTF(value),
    hasLocalizedValue: "true",
  },
  constantValueEnabled,
});

export const hasImageSource = (
  image: ImageType | ComplexImageType | TranslatableAssetImage | undefined,
): image is ImageType | ComplexImageType | TranslatableAssetImage => {
  if (!image || typeof image !== "object") {
    return false;
  }

  if ("url" in image && typeof image.url === "string") {
    return image.url.trim().length > 0;
  }

  return Boolean(
    "image" in image &&
      image.image &&
      typeof image.image === "object" &&
      "url" in image.image &&
      typeof image.image.url === "string" &&
      image.image.url.trim(),
  );
};
