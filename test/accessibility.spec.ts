import { By, Builder, Browser } from "selenium-webdriver";
import assert from "node:assert";

import { Audit, Logging } from "@siteimprove/alfa-test-utils";

import { Device } from "@siteimprove/alfa-device";
import { Page } from "@siteimprove/alfa-web";
import { Document } from "@siteimprove/alfa-dom";
import { Native } from "@siteimprove/alfa-dom/native";
import { Request, Response } from "@siteimprove/alfa-http";

const driver = new Builder().forBrowser(Browser.CHROME).build();
try {
  await driver.get("http://localhost:8080");

  const title = await driver.getTitle();
  assert.equal("Code Checker Example: PNPM", title);

  await driver.manage().setTimeouts({ implicit: 500 });

  console.log("Running Code Checker on first screen");
  const alfaResult1 = await testAccessibility();
  Logging.result(alfaResult1);

  let petNameInput = await driver.findElement(By.id("petName"));
  const nextButton = await driver.findElement(
    By.xpath('//button[text()="Next"]'),
  );
  await petNameInput.sendKeys("Fido");
  await nextButton.click();

  console.log("Running Code Checker on second screen");
  const alfaResult2 = await testAccessibility();
  Logging.result(alfaResult2);

  const favMovieInput = await driver.findElement(By.id("favMovie"));
  favMovieInput.sendKeys("The Good, the Bad and the Ugly");
  const submitButton = await driver.findElement(By.id("submit"));
  await submitButton.click();

  console.log("Running Code Checker on third screen");
  const alfaResult3 = await testAccessibility();
  Logging.result(alfaResult3);

  const summary = await driver.findElement(By.id("summary"));
  const value = await summary.getText();
  assert.equal(
    "Pet's Name: Fido\nFavorite Movie: The Good, the Bad and the Ugly",
    value,
  );

  const restartButton = await driver.findElement(
    By.xpath('//button[text()="Restart"]'),
  );
  await restartButton.click();
  petNameInput = await driver.findElement(By.id("petName"));
  assert.equal("", await petNameInput.getText());
} catch (e) {
  console.log(e);
} finally {
  await driver.quit();
}

async function testAccessibility() {
  const document = await driver.executeScript("return document;");
  const documentJSON = (await driver.executeScript(
    Native.fromNode,
    document,
  )) as Document.JSON;
  const device = Device.standard();
  const alfaPage = Page.of(
    Request.empty(),
    Response.empty(),
    Document.from(documentJSON, device),
    device,
  );

  return await Audit.run(alfaPage);
}
