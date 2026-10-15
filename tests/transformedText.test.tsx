/// <reference types="node" />
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  i18nPageInstance,
  toPuckFields,
  VisualEditorProvider,
  VisualEditorRender,
} from "@yext/visual-editor";
import { CasualDiningHero } from "../src/library/sections/CasualDiningHero";
import { CasualDiningStory } from "../src/library/sections/CasualDiningStory";
import { CasualDiningPromo } from "../src/library/sections/CasualDiningPromo";
import { CasualDiningDetails } from "../src/library/sections/CasualDiningDetails";
import { CasualDiningFooter } from "../src/library/sections/CasualDiningFooter";
import { CasualDiningHeader } from "../src/library/sections/CasualDiningHeader";
import { CasualDiningFaq } from "../src/library/sections/CasualDiningFaq";
import { CasualDiningFeatured } from "../src/library/sections/CasualDiningFeatured";
import { CasualDiningReviews } from "../src/library/sections/CasualDiningReviews";
import { CasualDiningLocations } from "../src/library/sections/CasualDiningLocations";

for (const [name, component] of Object.entries({
  CasualDiningHero,
  CasualDiningStory,
  CasualDiningPromo,
  CasualDiningDetails,
  CasualDiningFooter,
  CasualDiningHeader,
  CasualDiningFaq,
  CasualDiningFeatured,
  CasualDiningReviews,
  CasualDiningLocations,
})) {
  test(`when ${name} renders then props resolve without changing authored data`, async () => {
    await i18nPageInstance.changeLanguage("en");
    const data = {
      root: { props: {} },
      content: [
        {
          type: name,
          props: {
            ...structuredClone(component.defaultProps),
            ...(name === "CasualDiningDetails"
              ? {
                  phone: {
                    ...CasualDiningDetails.defaultProps!.phone,
                    includeHyperlink: true,
                  },
                }
              : {}),
            id: name,
          },
        },
      ],
    };
    const authoredData = structuredClone(data);
    const html = renderToStaticMarkup(
      <VisualEditorProvider
        templateProps={{
          document: {
            locale: "en",
            id: "restaurant",
            name: "Mapped Restaurant",
            description: "Resolved description",
            mainPhone: "+15125550148",
            address: {
              line1: "1 Main St",
              city: "Austin",
              region: "TX",
              postalCode: "78701",
              countryCode: "US",
            },
            hours: {
              monday: { openIntervals: [{ start: "09:00", end: "17:00" }] },
            },
            _env: {},
            __: {},
          },
        }}
      >
        <VisualEditorRender
          config={{
            components: {
              [name]: {
                render: component.render,
                fields: toPuckFields(component.fields!),
              },
            },
          }}
          data={data}
        />
      </VisualEditorProvider>,
    );
    assert.ok(html.length > 0);
    assert.ok(!html.includes("[object Object]"));
    assert.deepEqual(data, authoredData);
    if (name === "CasualDiningHero") {
      assert.ok(html.includes("Mapped Restaurant"));
    }
    if (name === "CasualDiningDetails") {
      assert.ok(html.includes("1 Main St"));
      assert.ok(html.includes('href="tel:+15125550148"'));
      assert.ok(html.includes("Dine-in"));
    }
  });
}

for (const { complexImage, constant } of [
  { complexImage: false, constant: true },
  { complexImage: true, constant: true },
  { complexImage: false, constant: false },
  { complexImage: true, constant: false },
]) {
  test(`when Hero uses ${constant ? "localized constants" : "entity fields"} with a ${complexImage ? "complex" : "simple"} image then clean values render`, async () => {
    await i18nPageInstance.changeLanguage("es");
    const props = structuredClone(CasualDiningHero.defaultProps!);
    props.heading.data.text = {
      field: "title",
      constantValueEnabled: constant,
      constantValue: { defaultValue: "Default title", es: "Título [[name]]" },
    };
    props.description.data.text = {
      field: "description",
      constantValueEnabled: constant,
      constantValue: {
        defaultValue: { html: "<p>Default description</p>" },
        es: { html: "<p>Descripción [[name]]</p>" },
      },
    };
    const image = {
      url: "/hero-es.jpg",
      height: 100,
      width: 200,
      alternateText: "Imagen",
    };
    props.background.image = {
      field: "heroImage",
      constantValueEnabled: constant,
      constantValue: complexImage ? { image } : image,
    };
    const data = {
      root: { props: {} },
      content: [{ type: "Hero", props: { ...props, id: "hero" } }],
    };
    const authoredData = structuredClone(data);
    const html = renderToStaticMarkup(
      <VisualEditorProvider
        templateProps={{
          document: {
            locale: "es",
            name: "Restaurante",
            title: "Título [[name]]",
            description: { html: "<p>Descripción [[name]]</p>" },
            heroImage: complexImage ? { image } : image,
            _env: {},
            __: {},
          },
        }}
      >
        <VisualEditorRender
          config={{
            components: {
              Hero: {
                render: CasualDiningHero.render,
                fields: toPuckFields(CasualDiningHero.fields!),
              },
            },
          }}
          data={data}
        />
      </VisualEditorProvider>,
    );
    assert.ok(html.includes("Título Restaurante"));
    assert.ok(html.includes("<p>Descripción Restaurante</p>"));
    assert.ok(html.includes("/hero-es.jpg"));
    assert.deepEqual(data, authoredData);
  });
}

for (const layout of [
  "casual-dining",
  "casual-dining-directory",
  "casual-dining-locator",
  "casual-dining-menu-page",
  "casual-dining-menu-item",
]) {
  test(`when ${layout} uses saved header and footer props then the authored layout renders unchanged`, async () => {
    await i18nPageInstance.changeLanguage("en");
    const layoutData = JSON.parse(
      readFileSync(
        new URL(
          `../src/library/layouts/${layout}/defaultLayout.json`,
          import.meta.url,
        ),
        "utf8",
      ),
    );
    const data = {
      root: { props: {} },
      content: layoutData.content.filter(
        (item: { type: string }) =>
          item.type === "CasualDiningHeader" ||
          item.type === "CasualDiningFooter",
      ),
    };
    const authoredData = structuredClone(data);
    const html = renderToStaticMarkup(
      <VisualEditorProvider
        templateProps={{
          document: { locale: "en", name: "Restaurant", _env: {}, __: {} },
        }}
      >
        <VisualEditorRender
          config={{
            components: {
              CasualDiningHeader: {
                render: CasualDiningHeader.render,
                fields: toPuckFields(CasualDiningHeader.fields!),
              },
              CasualDiningFooter: {
                render: CasualDiningFooter.render,
                fields: toPuckFields(CasualDiningFooter.fields!),
              },
            },
          }}
          data={data}
        />
      </VisualEditorProvider>,
    );
    assert.ok(html.length > 0);
    assert.ok(!html.includes("[object Object]"));
    assert.deepEqual(data, authoredData);
  });
}
