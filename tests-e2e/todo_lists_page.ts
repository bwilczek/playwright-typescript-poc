import { test, expect, type Page, type Locator } from '@playwright/test'

class ToDoListItem  {
  readonly root: Locator
  readonly name: Locator
  readonly removeButton: Locator

  constructor(root: Locator) {
    this.root = root
    this.name = root.locator("xpath=./*[@role='name']")
    this.removeButton = root.locator("xpath=./*[@role='rm']")
  }
}

class ToDoList {
  readonly root: Locator
  readonly title: Locator
  readonly addButton: Locator
  readonly newItemInput: Locator

  constructor(root: Locator) {
    this.root = root
    this.title = this.root.locator("xpath=./*[@role='title']")
    this.addButton = this.root.locator("xpath=./*[@role='add']")
    this.newItemInput = this.root.locator("xpath=./*[@role='new_item']")
  }

  async addItem(name: string) {
    await this.newItemInput.fill(name)
    await this.addButton.click()
  }

  async items(): Promise<Array<ToDoListItem>> {
    return (await this.root.getByRole('listitem').all()).map(item => new ToDoListItem(item))
  }

  async itemByName(name: string): Promise<ToDoListItem | undefined> {
    const items : Array<ToDoListItem> = await this.items()

    // Array.find won't work with async predicate, hence this loop
    for(const item of items) {
      const currentItemName = (await item.name.textContent())
      if(currentItemName == name) {
        return item
      }
    }
    return undefined
  }

  async itemsAsText(): Promise<Array<string | null>> {
    const items : Array<ToDoListItem> = await this.items()

    return await Promise.all(
      items.map(
        async (item) => {
          return await item.name.textContent()
        }
      )
    )
  }
}

class MultiToDoListPage {
  readonly page: Page

  constructor(page: Page) {
    this.page = page
  }

  async goto() {
    await this.page.goto('/watir_pump_tutorial/todo_lists.html')
  }

  async getListByTitle(title: string): Promise<ToDoList> {
    return new ToDoList(this.page.locator("xpath=//*[@role='todo_list']").filter({ has: this.page.getByText(title) }))
  }
}

test('using one of many lists on the page', async ({ page }) => {
  const app = new MultiToDoListPage(page)
  await app.goto()

  const homeList = await app.getListByTitle('Home')
  await expect(homeList.title).toHaveText('Home')
  await expect(homeList.title).toBeVisible()

  await homeList.addItem('Shopping')
  expect(await homeList.itemsAsText()).toContain('Shopping')

  const vacuumItem = await homeList.itemByName('Vacuum')
  expect(vacuumItem).toBeDefined()

  if(vacuumItem !== undefined) {
    expect(vacuumItem.name).toHaveText('Vacuum')
    await vacuumItem.removeButton.click()
    expect(await homeList.itemsAsText()).not.toContain('Vacuum')
  }
})
