import { Body } from "../shared/typography";
import { resolveBodyStyles, resolveTextStyles } from "../shared/typography";
import "../shared/typography.css";
import type { SectionConfig } from "@yext/visual-editor";
import { msg } from "@yext/visual-editor";

import { PuckComponent } from "@puckeditor/core";
import { CircleSlash2 } from "lucide-react";
import {
  MaybeRTF,
  PageSection,
  type StyledTextValue,
  type ThemeColor,
  type TranslatableRichText,
  VisibilityWrapper,
  type YextComponentConfig,
  type YextEntityField,
  type YextFieldMap,
  type YextTransformedProps,
  backgroundColors,
} from "@yext/visual-editor";
import { createRtfField, defaultTextStyles } from "../shared/sectionHelpers";

type CasualDiningBannerProps = {
  data: {
    text: YextEntityField<TranslatableRichText>;
    styles: StyledTextValue;
    fontColor?: ThemeColor;
  };
  styles: {
    textAlignment: "left" | "center" | "right";
  };
  section: {
    backgroundColor: ThemeColor;
    visibleOnLivePage: boolean;
  };
};

// `satisfies` keeps transform: true literal for YextTransformedProps.
const CasualDiningBannerFields = {
  data: {
    label: msg("fields.bannerText", "Banner Text"),
    type: "object",
    objectFields: {
      text: {
        label: msg("fields.text", "Text"),
        type: "entityField",
        transform: true,
        filter: {
          types: ["type.rich_text_v2"],
        },
      },
      styles: {
        label: msg("fields.textStyles", "Text Styles"),
        type: "styledText",
      },
      fontColor: {
        label: msg("fields.textColor", "Text Color"),
        type: "basicSelector",
        options: "SITE_COLOR",
      },
    },
  },
  styles: {
    label: msg("fields.styles", "Styles"),
    type: "object",
    objectFields: {
      textAlignment: {
        label: msg("fields.textAlignment", "Text Alignment"),
        type: "radio",
        options: [
          { label: msg("fields.options.left", "Left"), value: "left" },
          { label: msg("fields.options.center", "Center"), value: "center" },
          { label: msg("fields.options.right", "Right"), value: "right" },
        ],
      },
    },
  },
  section: {
    label: msg("fields.section", "Section"),
    type: "object",
    objectFields: {
      backgroundColor: {
        label: msg("fields.backgroundColor", "Background Color"),
        type: "basicSelector",
        options: "BACKGROUND_COLOR",
      },
      visibleOnLivePage: {
        label: msg("fields.visibleOnLivePage", "Visible on Live Page"),
        type: "radio",
        options: [
          { label: msg("fields.options.yes", "Yes"), value: true },
          { label: msg("fields.options.no", "No"), value: false },
        ],
      },
    },
  },
} satisfies YextFieldMap<CasualDiningBannerProps>;

const CasualDiningBannerComponent: PuckComponent<
  YextTransformedProps<CasualDiningBannerProps, typeof CasualDiningBannerFields>
> = ({
  data,
  styles,
  section,
  puck,
}) => {
  if (!data.text) {
    if (!puck.isEditing) {
      return <></>;
    }

    return (
      <PageSection
        background={section.backgroundColor}
        className="flex items-center justify-center"
        verticalPadding="sm"
      >
        <div className="relative flex h-20 w-full flex-row items-center justify-center gap-3 rounded-lg border border-gray-200 bg-gray-100 px-4">
          <CircleSlash2 className="h-10 w-10 flex-shrink-0 text-gray-400" />
          <div className="flex flex-col items-start">
            <Body className="text-gray-500" variant="sm">
              Section hidden for this page
            </Body>
            <Body className="font-normal text-gray-500" variant="sm">
              The banner field is empty
            </Body>
          </div>
        </div>
      </PageSection>
    );
  }

  const richTextStyleOverrides = {
    ...resolveTextStyles(data.styles),
    color: data.fontColor ?? section.backgroundColor.contrastingColor,
  };
  return (
    <PageSection
      background={section.backgroundColor}
      className={`flex items-center ${
        {
          left: "justify-start text-left",
          center: "justify-center text-center",
          right: "justify-end text-right",
        }[styles.textAlignment]
      }`}
      verticalPadding="sm"
    >
      <MaybeRTF
        data={data.text}
        style={resolveBodyStyles(data.styles)}
        richTextStyleOverrides={richTextStyleOverrides}
      />
    </PageSection>
  );
};

/**
 * Displays a full-width, editor-configurable rich-text banner.
 */
export const CasualDiningBanner: YextComponentConfig<
  CasualDiningBannerProps,
  typeof CasualDiningBannerFields
> = {
  label: msg("components.bannerLabel", "Banner"),
  fields: CasualDiningBannerFields,
  defaultProps: {
    data: {
      text: createRtfField("Banner Text"),
      styles: defaultTextStyles,
    },
    styles: {
      textAlignment: "center",
    },
    section: {
      backgroundColor: backgroundColors.color1.value,
      visibleOnLivePage: true,
    },
  },
  render: (props) => (
    <VisibilityWrapper
      isEditing={props.puck.isEditing}
      liveVisibility={props.section.visibleOnLivePage}
    >
      <CasualDiningBannerComponent {...props} />
    </VisibilityWrapper>
  ),
};

export const config: SectionConfig = {
  id: "CasualDiningBanner",
  displayName: "Banner",
  description: "Banner",
  pageSetTypes: ["ENTITY", "DIRECTORY", "LOCATOR"],
};
