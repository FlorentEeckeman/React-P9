/**
 * @jest-environment jsdom
 */
import "@testing-library/jest-dom";
$.fn.modal = jest.fn();
import {
  screen,
  getByTestId,
  getByRole,
  getAllByTestId,
  waitFor,
} from "@testing-library/dom";
import BillsUI from "../views/BillsUI.js";
import Bills from "../containers/Bills.js";
import { bills } from "../fixtures/bills.js";
import { ROUTES_PATH } from "../constants/routes.js";
import { ROUTES } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store.js";
import router from "../app/Router.js";
import userEvent from "@testing-library/user-event";
import ErrorPage from "../views/ErrorPage.js";
import mockStoreCorrupt from "../__mocks__/storeError.js";

jest.mock("../app/store", () => mockStore);
afterEach(() => {
  jest.clearAllMocks();
});
// Test Bills UI
describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
          email: "employee@test.tld",
          status: "connected",
        })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByTestId("icon-window"));
      const windowIcon = screen.getByTestId("icon-window");
      expect(windowIcon).toHaveClass("active-icon");
      //to-do write expect expression
    });
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills });
      const dates = screen
        .getAllByText(
          /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
        )
        .map((a) => a.innerHTML);
      const antiChrono = (a, b) => (a < b ? 1 : -1);
      const datesSorted = [...dates].sort(antiChrono);
      expect(dates).toEqual(datesSorted);
    });
    test("Then if i click on eyes modal with picture should appear", () => {
      const button = getAllByTestId(document.body, "icon-eye")[0];
      const modal = screen.getByRole("dialog", { hidden: true });
      userEvent.click(button);
      expect(modal).toBeVisible();
    });
    test("Then clicking on new Bill should redirect me", async () => {
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getAllByTestId("icon-window"));
      userEvent.click(getByTestId(document.body, "btn-new-bill"));
      expect(global.window.location.href).toContain("/bill/new");
    });
    test("should show all bills", () => {
      const button = getAllByTestId(document.body, "icon-eye");
      expect(button.length / 2).toEqual(bills.length);
    });
  });
});
// Test bad Request
describe("when i am on bills page and i load bills", () => {
  beforeEach(() => {
    jest.spyOn(mockStore, "bills");
    Object.defineProperty(window, "localStorage", {
      value: localStorageMock,
    });
    window.localStorage.setItem(
      "user",
      JSON.stringify({
        type: "Employee",
        email: "employee@test.tld",
      })
    );
    const root = document.createElement("div");
    root.setAttribute("id", "root");
    document.body.appendChild(root);
    router();
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  test(" should have request status 404", async () => {
    mockStore.bills.mockImplementationOnce(() => {
      return {
        list: () => {
          return Promise.reject(new Error("Erreur 404"));
        },
      };
    });

    window.onNavigate(ROUTES_PATH.Bills);
    await new Promise(process.nextTick);
    const message = await screen.getByText(/Erreur 404/);
    expect(message).toBeTruthy();
  });
  test(" should have request status 500", async () => {
    mockStore.bills.mockImplementationOnce(() => {
      return {
        list: () => {
          return Promise.reject(new Error("Erreur 500"));
        },
      };
    });

    window.onNavigate(ROUTES_PATH.Dashboard);
    await new Promise(process.nextTick);
    const message = await screen.getByText(/Erreur 500/);
    expect(message).toBeTruthy();
  });
});
// Test Bills function
describe("when i am on bills page", () => {
  test(" eyes icons should be clickable", async () => {
    const onNavigate = (pathname) => {
      document.body.innerHTML = ROUTES({ pathname });
    };

    Object.defineProperty(window, "localStorage", {
      value: localStorageMock,
    });
    window.localStorage.setItem(
      "user",
      JSON.stringify({
        type: "Employee",
      })
    );
    const root = document.createElement("div");
    root.setAttribute("id", "root");
    document.body.append(root);
    router();
    const bill = new Bills({
      document,
      onNavigate,
      store: mockStore,
      localStorage: window.localStorage,
    });
    document.body.innerHTML = BillsUI({ data: bills });

    await waitFor(() => screen.getAllByTestId("icon-window"));
    const eye = screen.getAllByTestId("icon-eye")[1];
    const jestIconEyes = jest.fn((eye) => bill.handleClickIconEye(eye));

    eye.addEventListener("click", jestIconEyes(eye));

    userEvent.click(eye);

    expect(jestIconEyes).toHaveBeenCalled();
  });
  test(" new bill should be clickable", () => {
    const onNavigate = (pathname) => {
      document.body.innerHTML = ROUTES({ pathname });
    };
    Object.defineProperty(window, "localStorage", {
      value: localStorageMock,
    });
    window.localStorage.setItem(
      "user",
      JSON.stringify({
        type: "Employee",
      })
    );
    const root = document.createElement("div");
    root.setAttribute("id", "root");
    document.body.append(root);
    router();
    const bill = new Bills({
      document,
      onNavigate,
      store: mockStore,
      localStorage: window.localStorage,
    });
    document.body.innerHTML = BillsUI({ data: bills });
    const jestNewBill = jest.fn(() => bill.handleClickNewBill());
    const newBill = screen.getByTestId("btn-new-bill");
    newBill.addEventListener("click", jestNewBill);
    userEvent.click(newBill);
    expect(jestNewBill).toHaveBeenCalled();
  });

  test("all bills should appears", async () => {
    Object.defineProperty(window, "localStorage", {
      value: localStorageMock,
    });
    const onNavigate = (pathname) => {
      document.body.innerHTML = ROUTES({ pathname });
    };
    window.localStorage.setItem(
      "user",
      JSON.stringify({
        type: "Employee",
      })
    );

    const bill = new Bills({
      document,
      onNavigate,
      store: mockStore,
      localStorage: window.localStorage,
    });
    const jestFn = jest.fn(() => bill.getBills());
    // const testFn = jest.spyOn(bill.getBills(), "list");
    const resFn = jestFn(mockStore);

    expect(resFn.length).toBe(mockStore.length);
    const billError = new Bills({
      document,
      onNavigate,
      store: mockStoreCorrupt,
      localStorage: window.localStorage,
    });
    const jestFnError = jest.fn(() => billError.getBills());
    const resFnError = jestFnError(mockStoreCorrupt);

    expect(resFnError).toEqual(mockStoreCorrupt.bills().list());
  });
});
