import * as React from "react";
import {
  getThemeColorCssValue,
  type BodyProps,
} from "@yext/visual-editor";
import "./typography.css";

// Unlike platform tokens, these properties survive nested .components resets.
export const resolveBodyStyles = (
  styles?: React.CSSProperties,
): React.CSSProperties => {
  const variables = Object.fromEntries(
    Object.entries(styles ?? {})
      .filter(([, value]) => value !== undefined)
      .map(([property, value]) => [`--casual-dining-body-${property}`, value]),
  );
  return { ...styles, ...variables };
};

export const resolveRichTextStyles = (
  styles?: React.CSSProperties,
): React.CSSProperties => {
  const bodyVariables = Object.fromEntries(
    Object.entries(styles ?? {})
      .filter(([, value]) => value !== undefined)
      .map(([property, value]) => [`--${property}-body-${property}`, value]),
  );
  return { ...resolveBodyStyles(styles), ...bodyVariables };
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
