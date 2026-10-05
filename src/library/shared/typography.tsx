import * as React from "react";
import { useTranslation } from "react-i18next";
import {
  EntityField,
  MaybeRTF,
  StyledTextElement,
  getThemeColorCssValue,
  renderStyledRichText,
  resolveComponentData,
  useDocument,
  type BodyProps,
  type StyledPlainTextProps,
  type StyledRichTextProps,
  type StyledTextValue,
} from "@yext/visual-editor";
import "./typography.css";

export const resolveTextStyles = (styles?: Partial<StyledTextValue>) => ({
  fontFamily: styles?.fontFamily === "default" ? undefined : styles?.fontFamily,
  fontSize: styles?.fontSize === "default" ? undefined : styles?.fontSize,
  fontWeight: styles?.fontWeight === "default" ? undefined : styles?.fontWeight,
  fontStyle: styles?.fontStyle === "default" ? undefined : styles?.fontStyle,
  textTransform:
    styles?.textTransform === "default" ? undefined : styles?.textTransform,
});

// Unlike platform tokens, these properties survive nested .components resets.
export const resolveBodyStyles = (
  styles?: Partial<StyledTextValue>,
): React.CSSProperties => {
  const resolved = resolveTextStyles(styles);
  const variables = Object.fromEntries(
    Object.entries(resolved)
      .filter(([, value]) => value !== undefined)
      .map(([property, value]) => [`--casual-dining-body-${property}`, value]),
  );
  return { ...resolved, ...variables };
};

const resolveRichTextStyles = (
  styles?: Partial<StyledTextValue>,
): React.CSSProperties => {
  const resolved = resolveTextStyles(styles);
  const bodyVariables = Object.fromEntries(
    Object.entries(resolved)
      .filter(([, value]) => value !== undefined)
      .map(([property, value]) => [`--${property}-body-${property}`, value]),
  );
  return { ...resolveBodyStyles(styles), ...bodyVariables };
};

// resolveComponentData may wrap a MaybeRTF in another rtf-theme element.
// Forward overrides to the renderer and its inner wrapper, preserving headings
// and links as separate semantic roles.
export const applyRichTextOverrides = (
  content: React.ReactNode,
  fontOptions?: Partial<StyledTextValue>,
): React.ReactNode => {
  if (Array.isArray(content)) {
    return content.map((child) => applyRichTextOverrides(child, fontOptions));
  }
  if (!React.isValidElement(content)) {
    return content;
  }
  const element = content as React.ReactElement<{
    children?: React.ReactNode;
    style?: React.CSSProperties;
    richTextStyleOverrides?: Partial<StyledTextValue>;
  }>;
  if (typeof element.type === "string" && /^(h[1-6]|a)$/.test(element.type)) {
    return element;
  }
  const overrides = resolveTextStyles(fontOptions);
  return React.cloneElement(element, {
    ...(element.type === MaybeRTF
      ? {
          richTextStyleOverrides: {
            ...element.props.richTextStyleOverrides,
            ...overrides,
            color: fontOptions?.color,
          },
        }
      : {}),
    style: { ...element.props.style, ...resolveRichTextStyles(fontOptions) },
    ...(element.props.children !== undefined
      ? { children: applyRichTextOverrides(element.props.children, fontOptions) }
      : {}),
  });
};

export const StyledTextComponent = (
  props: (StyledPlainTextProps | StyledRichTextProps) & {
    kind: "plain" | "richText";
  },
) => {
  const { i18n } = useTranslation();
  const document = useDocument();
  const content = resolveComponentData(props.data.text, i18n.language, document);
  const fontOptions = props.fontOptions;
  if (!content) {
    return <></>;
  }
  return (
    <EntityField
      displayName={props.kind === "plain" ? "Text" : "Body"}
      fieldId={props.data.text.field}
      constantValueEnabled={props.data.text.constantValueEnabled}
    >
      {props.kind === "plain" ? (
        <StyledTextElement
          as={props.tag}
          align={props.alignment}
          color={fontOptions?.color}
          className="casual-dining-text"
          style={resolveTextStyles(fontOptions)}
        >
          {content}
        </StyledTextElement>
      ) : (
        <div
          className="casual-dining-body"
          style={{
            ...resolveRichTextStyles(fontOptions),
            color: getThemeColorCssValue(fontOptions?.color),
          }}
        >
          {applyRichTextOverrides(
            renderStyledRichText({
              content,
              align: props.alignment,
              text: fontOptions,
            }),
            fontOptions,
          )}
        </div>
      )}
    </EntityField>
  );
};

// Body variants previously supplied fixed size offsets and an inline theme
// transform. Use CSS defaults so inherited field overrides remain effective.
export const Body = React.forwardRef<HTMLParagraphElement, BodyProps>(
  ({ variant: _variant, color, className, style, ...props }, ref) => (
    <p
      {...props}
      ref={ref}
      className={`components casual-dining-body ${className ?? ""}`}
      style={{ color: getThemeColorCssValue(color), ...style }}
    />
  ),
);
Body.displayName = "Body";
