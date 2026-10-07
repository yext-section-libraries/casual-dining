import {
  getThemeColorCssValue,
  MaybeRTF,
  msg,
  StyledTextElement,
  type RichText,
  type StyledPlainTextProps,
  type YextFieldMap,
} from "@yext/visual-editor";
import { defaultTextStyles } from "./sectionHelpers";
import {
  applyRichTextOverrides,
  resolveRichTextStyles,
  resolveTextStyles,
} from "./typography";

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
  props: Omit<StyledPlainTextProps, "data"> &
    (
      | { kind: "plain"; data: { text: string | undefined } }
      | { kind: "richText"; data: { text: RichText | string | undefined } }
    ),
) => {
  if (props.kind === "plain") {
    return props.data.text ? (
      <StyledTextElement
        as={props.tag}
        align={props.alignment}
        color={props.fontOptions.color}
        className="casual-dining-text"
        style={resolveTextStyles(props.fontOptions)}
      >
        {props.data.text}
      </StyledTextElement>
    ) : null;
  }
  return props.data.text ? (
    <div
      className="casual-dining-body"
      style={{
        ...resolveRichTextStyles(props.fontOptions),
        color: getThemeColorCssValue(props.fontOptions.color),
      }}
    >
      {applyRichTextOverrides(
        <MaybeRTF
          data={props.data.text}
          className={`components${props.alignment ? ` text-${props.alignment}` : ""}`}
          richTextStyleOverrides={props.fontOptions}
        />,
        props.fontOptions,
      )}
    </div>
  ) : null;
};
