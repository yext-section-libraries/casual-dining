import "../shared/typography.css";
import type { SectionConfig } from "@yext/visual-editor";
import { msg } from "@yext/visual-editor";

import * as React from "react";
import { type PuckComponent } from "@puckeditor/core";
import { Link } from "@yext/pages-components";
import {
  Background,
  pt,
  resolveBreadcrumbs,
  useDocument,
  useTemplateProps,
  VisibilityWrapper,
  type ThemeColor,
  type StyledTextValue,
  type YextComponentConfig,
  type YextFieldMap,
  type YextTransformedProps,
} from "@yext/visual-editor";

type CasualDiningBreadcrumbsProps = {
  section: {
    backgroundColor: ThemeColor;
    visibleOnLivePage: boolean;
  };
  includeCurrentLocation: boolean;
  breadcrumbLinks: {
    styles: StyledTextValue;
    fontColor?: ThemeColor;
  };
};

const fields = {
  section: {
    label: msg("fields.section", "Section"),
    type: "object",
    objectFields: {
      visibleOnLivePage: {
        label: msg("fields.visibleOnLivePage", "Visible on Live Page"),
        type: "radio",
        options: [
          { label: msg("fields.options.yes", "Yes"), value: true },
          { label: msg("fields.options.no", "No"), value: false },
        ],
      },
      backgroundColor: {
        label: msg("fields.backgroundColor", "Background Color"),
        type: "basicSelector",
        options: "BACKGROUND_COLOR",
        transform: true,
        format: "surface",
      },
    },
  },
  includeCurrentLocation: {
    label: msg("fields.includeCurrentLocation", "Include Current Location"),
    type: "radio",
    options: [
      { label: msg("fields.options.yes", "Yes"), value: true },
      { label: msg("fields.options.no", "No"), value: false },
    ],
  },
  breadcrumbLinks: {
    label: msg("fields.breadcrumbLinks", "Breadcrumb Links"),
    type: "object",
    objectFields: {
      styles: {
        label: msg("fields.textStyles", "Text Styles"),
        type: "styledText",
        transform: true,
      },
      fontColor: {
        label: msg("fields.fontColor", "Font Color"),
        type: "basicSelector",
        options: "SITE_COLOR",
        transform: true,
      },
    },
  },
} satisfies YextFieldMap<CasualDiningBreadcrumbsProps>;

const CasualDiningBreadcrumbsComponent: PuckComponent<
  YextTransformedProps<CasualDiningBreadcrumbsProps, typeof fields>
> = (props) => {
  const streamDocument = useDocument();
  const { relativePrefixToRoot } = useTemplateProps();
  const breadcrumbs = resolveBreadcrumbs(streamDocument);
  const visibleBreadcrumbs =
    props.includeCurrentLocation || breadcrumbs.length <= 1
    ? breadcrumbs
    : breadcrumbs.slice(0, -1);
  const breadcrumbLinkStyle: React.CSSProperties = {
    color: props.breadcrumbLinks.fontColor,
    ...(props.breadcrumbLinks.styles as React.CSSProperties),
  };

  if (!breadcrumbs.length) {
    return props.puck?.isEditing ? (
      <p
        style={{
          padding: "18px 24px",
        }}
      >
        {pt(
          "noBreadcrumbsAvailable",
          "No breadcrumbs available (section will be hidden on live page). Create a directory to enable breadcrumbs.",
        )}
      </p>
    ) : (
      <></>
    );
  }

  return (
    <VisibilityWrapper
      liveVisibility={props.section.visibleOnLivePage}
      isEditing={Boolean(props.puck?.isEditing)}
    >
      <Background
        as="nav"
        background={props.section.backgroundColor}
        aria-label="Breadcrumb"
      >
        <ol
          className="mx-auto flex w-full max-w-[1440px] flex-wrap items-center gap-x-2 gap-y-1 px-4 py-3 sm:px-8"
          style={breadcrumbLinkStyle}
        >
          {visibleBreadcrumbs.map(({ name, slug }, breadcrumbIndex) => {
            const isCurrentPage =
              props.includeCurrentLocation &&
              breadcrumbIndex === visibleBreadcrumbs.length - 1;
            const label = isCurrentPage ? streamDocument.name || name : name;
            const href = relativePrefixToRoot
              ? relativePrefixToRoot + slug
              : slug;

            return (
              <li key={slug} className="flex items-center gap-x-2">
                {breadcrumbIndex > 0 && (
                  <span aria-hidden="true" className="opacity-70">
                    /
                  </span>
                )}
                {isCurrentPage ? (
                  <span className="casual-dining-link" style={breadcrumbLinkStyle} aria-current="page">{label}</span>
                ) : (
                  <Link
                    eventName={`breadcrumb${breadcrumbIndex}`}
                    href={href}
                    style={breadcrumbLinkStyle}
                  >
                    {name}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </Background>
    </VisibilityWrapper>
  );
};

export const CasualDiningBreadcrumbs: YextComponentConfig<
  CasualDiningBreadcrumbsProps,
  typeof fields
> = {
    label: msg("components.breadcrumbs", "Breadcrumbs"),
    fields,
    defaultProps: {
      section: {
        backgroundColor: {
          selectedColor: "palette-secondary",
          contrastingColor: "palette-secondary-contrast",
        },
        visibleOnLivePage: true,
      },
      includeCurrentLocation: true,
      breadcrumbLinks: {
        styles: {
          fontFamily: "default",
          fontSize: "default",
          fontWeight: "default",
          fontStyle: "default",
          textTransform: "default",
        },
        fontColor: undefined,
      },
    },
    render: CasualDiningBreadcrumbsComponent,
};

export const config: SectionConfig = {
  id: "CasualDiningBreadcrumbs",
  displayName: "Breadcrumbs",
  description: "Breadcrumbs",
  pageSetTypes: ["ENTITY"],
};
