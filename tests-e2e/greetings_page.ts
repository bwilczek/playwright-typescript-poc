import { test, expect, type Page, type Locator } from '@playwright/test'

class GreetingsPage {
  readonly page: Page
  readonly nameInput: Locator
  readonly setNameButton: Locator
  readonly greetingText: Locator

  constructor(page: Page) {
    this.page = page;
    this.nameInput = page.locator('#name')
    this.setNameButton = page.locator('#set_name')
    this.greetingText = page.locator('#greeting')
  }

  async goto() {
    await this.page.goto('/watir_pump_tutorial/greeter.html')
  }

  async greet(name: string) {
    await this.nameInput.fill(name)
    await this.setNameButton.click()
  }
}

test('greeting', async ({ page }) => {
  const app = new GreetingsPage(page)
  await app.goto()
  await app.greet('Playwright')

  await expect(app.greetingText).toHaveText('Hello Playwright!')
})
