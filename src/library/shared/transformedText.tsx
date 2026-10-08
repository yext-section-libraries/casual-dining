import {
  MaybeRTF,
  msg,
  StyledTextElement,
  type RichText,
  type RichTextStyleOverrides,
  type StyledPlainTextProps,
  type YextFieldMap,
} from "@yext/visual-editor";
import type { CSSProperties } from "react";
import { defaultTextStyles } from "./sectionHelpers";
import { resolveRichTextStyles } from "./typography";

/** Builds authored text fields that opt into Puck's render transforms. */
export const createTextConfig = <Kind extends "plain" | "richText">(
  kind: Kind,
) => ({
  fields: {
    data: {
      type: "object",
      label: msg("fields.text", "Text"),
      objectFields: {
        text: {
          type: "entityField",
          transform: true,
          label: msg("fields.text", "Text"),
          filter: {
            types: (kind === "plain"
              ? ["type.string"]
              : ["type.string", "type.rich_text_v2"]) as Kind extends "plain"
              ? ["type.string"]
              : ["type.string", "type.rich_text_v2"],
          },
        },
      },
    },
    fontOptions: {
      type: "styledText",
      transform: true,
      label: msg("fields.fontOptions", "Font Options"),
      includeColor: true,
      colorLabel: msg("fields.fontColor", "Font Color"),
    },
  } satisfies YextFieldMap<StyledPlainTextProps>,
  defaultProps: {
    data: {
      text: {
        field: "",
        constantValue: { defaultValue: "Text" },
        constantValueEnabled: true,
      },
    },
    fontOptions: defaultTextStyles,
  },
});

/** Applies existing typography to transformed text without resolving authored fields. */
export const TransformedText = (
  props: Omit<StyledPlainTextProps, "data" | "fontOptions"> & {
    fontOptions: object;
  } &
    (
      | { kind: "plain"; data: { text: string | undefined } }
      | { kind: "richText"; data: { text: RichText | string | undefined } }
    ),
) => {
  const fontOptions = props.fontOptions as CSSProperties;
  if (props.kind === "plain") {
    return props.data.text ? (
      <StyledTextElement
        as={props.tag}
        align={props.alignment}
        className="casual-dining-text"
        style={fontOptions}
      >
        {props.data.text}
      </StyledTextElement>
    ) : null;
  }
  return props.data.text ? (
    <div
      className="casual-dining-body"
      style={{ ...resolveRichTextStyles(fontOptions), color: fontOptions.color }}
    >
      {/* MaybeRTF may add an rtf-theme wrapper. Forward the transformed styles
          to its renderer while headings and links keep their theme roles. */}
      <MaybeRTF
        data={props.data.text}
        className={`components${props.alignment ? ` text-${props.alignment}` : ""}`}
        richTextStyleOverrides={fontOptions as RichTextStyleOverrides}
      />
    </div>
  ) : null;
};
