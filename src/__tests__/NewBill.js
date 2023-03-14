/**
 * @jest-environment jsdom
 */
import "@testing-library/jest-dom";
import {
  screen,
  getAllByTestId,
  getByTestId,
  waitFor,
  fireEvent,
} from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import userEvent from "@testing-library/user-event";
import { ROUTES } from "../constants/routes.js";
import { ROUTES_PATH } from "../constants/routes.js";
import router from "../app/Router.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store.js";
import { async } from "regenerator-runtime";

describe("Given I am connected as an employee", () => {
  beforeEach(() => {
    window.getComputedStyle = () => {};
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
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  // Test NewBill UI & Form
  describe("When I am on NewBill Page", () => {
    test("Then newBill icon in vertical layout should be highlighted", async () => {
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.NewBill);
      await waitFor(() => screen.getByTestId("icon-mail"));
      const windowIcon = screen.getByTestId("icon-mail");
      expect(windowIcon).toHaveClass("active-icon");
      //to-do write expect expression
    });
    test("Then the number of options should be 7", async () => {
      await waitFor(() => screen.getByTestId("form-new-bill"));
      //const transportType = screen.getByTestId("expense-type");
      expect(screen.getByTestId("expense-type").length).toBe(7);
      expect(screen.getByTestId("expense-type")[6].value).toBe(
        "Fournitures de bureau"
      );
      //to-do write expect expression
    });
    test("Then datepicker should accept a date value", async () => {
      const testDate = "2020-12-10";

      await waitFor(() => screen.getByTestId("form-new-bill"));
      const datepicker = screen.getByTestId("datepicker");
      datepicker.value = testDate;
      expect(datepicker.value).toBe(testDate);
    });
    test("Then Montant should accept a number value", async () => {
      const testPrice = "500";

      await waitFor(() => screen.getByTestId("form-new-bill"));
      const amount = screen.getByTestId("amount");
      amount.value = testPrice;
      expect(screen.getByTestId("amount").value).toBe(testPrice);
    });
    test("Then Montant should not accept a string value", async () => {
      const testPrice = "test-date";

      await waitFor(() => screen.getByTestId("form-new-bill"));
      const amount = screen.getByTestId("amount");
      amount.value = testPrice;
      expect(amount.value).not.toBe(testPrice);
    });
    test("Then TVA should accept a number value", async () => {
      const testTVA = "5";

      await waitFor(() => screen.getByTestId("form-new-bill"));
      const vat = screen.getByTestId("vat");
      const pct = screen.getByTestId("pct");
      vat.value = testTVA;
      pct.value = testTVA;
      expect(vat.value + "," + pct.value).toBe(testTVA + "," + testTVA);
    });
    test("Then commentary should accept a text", async () => {
      const testCommentary = "Test commentary";

      await waitFor(() => screen.getByTestId("form-new-bill"));
      const commentary = screen.getByTestId("commentary");
      commentary.value = testCommentary;
      expect(commentary.value).toBe(testCommentary);
    });
    test("Then I can change file", async () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      const html = NewBillUI();
      document.body.innerHTML = html;
      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });

      const dataTest = {
        preventDefault: () => {},
        target: {
          value: "https://risibank.fr/cache/medias/0/21/2188/218864/full.png",
        },
      };

      const jestChangeFile = jest.fn((e) => newBill.handleChangeFile(e));

      await waitFor(() => screen.getByTestId("form-new-bill"));
      const fileChange = screen.getByTestId("file");

      fileChange.addEventListener("click", jestChangeFile(dataTest));
      userEvent.click(fileChange);
      expect(jestChangeFile).toHaveBeenCalled();
    });
    test("Then I should submit form", async () => {
      const jestSubmit = jest.spyOn(mockStore.bills(), "update");
      const commentary = screen.getByText("Envoyer");
      userEvent.click(commentary);
      expect(jestSubmit).toHaveBeenCalled();
    });

    test("Then I can submit form", async () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      const html = NewBillUI();
      document.body.innerHTML = html;
      const newBillTest = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });

      await waitFor(() => screen.getByTestId("form-new-bill"));
      const element = screen.getByTestId("form-new-bill");
      const dataTest = {
        preventDefault: () => {},
        target: element,
      };
      const jestHandleSubmit = jest.fn((e) => newBillTest.handleSubmit(e));
      const fileChange = screen.getByTestId("file");

      fileChange.addEventListener("click", jestHandleSubmit(dataTest));
      userEvent.click(fileChange);
      expect(jestHandleSubmit).toHaveBeenCalled();
    });
  });
});
describe("when i am on bills page and i load bills", () => {
  beforeEach(async () => {
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

    const html = NewBillUI();
    document.body.innerHTML = html;
    await waitFor(() => screen.getByTestId("form-new-bill"));

    const datepicker = screen.getByTestId("datepicker");
    datepicker.value = "2020-12-10";
    const amount = screen.getByTestId("amount");
    amount.value = "500";
    const vat = screen.getByTestId("vat");
    const pct = screen.getByTestId("pct");
    vat.value = 5;
    pct.value = 5;
    const commentary = screen.getByTestId("commentary");
    commentary.value = "test commentary";
    const testImageFile = new File(["hello"], "hello.png", {
      type: "image/png",
    });
    const fileChange = screen.getByTestId("file");
    userEvent.upload(fileChange, testImageFile);
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  test("Then I can submit form", async () => {
    const onNavigate = (pathname) => {
      document.body.innerHTML = ROUTES({ pathname });
    };

    const newBillTest = new NewBill({
      document,
      onNavigate,
      store: mockStore,
      localStorage: window.localStorage,
    });

    const element = screen.getByTestId("form-new-bill");

    const dataTest = {
      preventDefault: () => {},
      target: element,
    };
    const jestHandleSubmit = jest.fn((e) => newBillTest.handleSubmit(e));
    //const fileChange = screen.getByTestId("file");
    const commentary = screen.getByText("Envoyer");
    userEvent.click(commentary);
    commentary.addEventListener("click", jestHandleSubmit(dataTest));
    userEvent.click(commentary);
    expect(jestHandleSubmit).toHaveBeenCalled();
  });

  // Test Bad Request
  test(" should have request status 404", async () => {
    const onNavigate = (pathname) => {
      document.body.innerHTML = ROUTES({ pathname });
    };
    const errorMsg = new Error("Erreur 404");
    mockStore.bills.mockImplementationOnce(() => {
      return {
        update: () => {
          return Promise.reject(errorMsg);
        },
      };
    });
    const newBillTest = new NewBill({
      document,
      onNavigate,
      store: mockStore,
      localStorage: window.localStorage,
    });

    const element = screen.getByTestId("form-new-bill");

    const dataTest = {
      preventDefault: () => {},
      target: element,
    };
    const warn = jest.spyOn(console, "error");
    const jestHandleSubmitError = jest.fn((e) => newBillTest.handleSubmit(e));

    const commentary = screen.getByText("Envoyer");
    userEvent.click(commentary);
    commentary.addEventListener("click", jestHandleSubmitError(dataTest));
    userEvent.click(commentary);

    //const message = await screen.getByText(/Erreur 404/);

    await waitFor(() => {
      expect(warn).toBeCalledWith(errorMsg);
    });
    warn.mockReset();
  });
  test(" should have request status 500", async () => {
    const onNavigate = (pathname) => {
      document.body.innerHTML = ROUTES({ pathname });
    };
    const errorMsg = new Error("Erreur 500");
    mockStore.bills.mockImplementationOnce(() => {
      return {
        update: () => {
          return Promise.reject(errorMsg);
        },
      };
    });
    const newBillTest = new NewBill({
      document,
      onNavigate,
      store: mockStore,
      localStorage: window.localStorage,
    });

    const element = screen.getByTestId("form-new-bill");

    const dataTest = {
      preventDefault: () => {},
      target: element,
    };
    const warn = jest.spyOn(console, "error");
    const jestHandleSubmitError = jest.fn((e) => newBillTest.handleSubmit(e));

    const commentary = screen.getByText("Envoyer");
    userEvent.click(commentary);
    commentary.addEventListener("click", jestHandleSubmitError(dataTest));
    userEvent.click(commentary);

    //const message = await screen.getByText(/Erreur 404/);

    await waitFor(() => {
      expect(warn).toBeCalledWith(errorMsg);
    });
    warn.mockReset();
  });
});
