import "./style.css";
//@ts-ignore:next-line
import * as basicLightbox from "basiclightbox";
import axios from "axios";
import { getRandomNumber } from "./helpers";
import { Image } from "./interfaces";

//--------------------ASSIGNMENT 1----------------------//

export default class StringBuilder {
  value: string;

  constructor(baseString: string = "") {
    this.value = baseString;
  }

  append(str: string) {
    this.value += str;
    return this;
  }

  prepend(str: string) {
    this.value = str + this.value;
    return this;
  }

  pad(str: string) {
    this.value = str + this.value + str;
    return this;
  }
}

const builder = new StringBuilder(".");
builder.append("^").prepend("^").pad("=");
console.log(builder.value); // '=^.^='

//--------------------ASSIGNMENT 2----------------------//

const boxesList = document.getElementById("boxes")!;
const createButton = document.querySelector('button[data-action="create"]')!;
const destroyButton = document.querySelector('button[data-action="destroy"]')!;
const input: HTMLInputElement = document.querySelector(".js-input")!;

const renderDiv = (index: number = 0) => {
  const div = document.createElement("div");
  div.style.backgroundColor = `hsl(${getRandomNumber(0, 360)}, 80%, 80%)`;
  div.style.width = `${30 + 10 * index}px`;
  div.style.height = `${30 + 10 * index}px`;
  boxesList.appendChild(div);
};

function createBoxes(amount: number) {
  destroyBoxes();
  for (let i = 0; i < amount; i++) {
    renderDiv(i);
  }
}

const destroyBoxes = () => {
  boxesList.innerHTML = "";
};

createButton?.addEventListener("click", () => createBoxes(+input.value || 0));
destroyButton?.addEventListener("click", destroyBoxes);

//--------------------ASSIGNMENT 3----------------------//

const searchInput: HTMLInputElement = document.querySelector("#search-input")!;
const searchButton = document.querySelector("#search-button")!;
const imageListElement = document.querySelector("#images-list")!;
const bottomLine = document.querySelector("#bottom-line")!;

class ImageList {
  currentPage: number;

  constructor() {
    this.currentPage = 1;
  }

  #renderImages(images: Image[]) {
    images.forEach((image) => {
      imageListElement.appendChild(this.#createListItem(image));
    });
  }

  async #searchImages(query: string, page: number = 1) {
    try {
      const { data } = await axios.get(
        `https://pixabay.com/api/?key=30477761-7da205545dd2ed5a4d03dce3b&page=${page}&q=${query}`
      );
      const images = data.hits as Image[];
      this.#renderImages(images);
      this.currentPage++;
    } catch (err) {
      console.error(err || "Something went wrong");
    }
  }

  #createListItem({ webformatURL, largeImageURL }: Image) {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = "#";
    a.addEventListener("click", () => this.#showLargeImage(largeImageURL));
    a.insertAdjacentHTML(
      "beforeend",
      `<img data-source="${largeImageURL}" src="${webformatURL}">`
    );
    li.appendChild(a);
    return li;
  }

  #showLargeImage(url: string) {
    const instance = basicLightbox.create(`
      <img src="${url}" alt="">
    `);
    instance.show();
  }

  observe() {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach(async (entry) => {
          if (entry.isIntersecting) {
            await this.#searchImages(searchInput.value, this.currentPage);
          }
        });
      },
      { rootMargin: "10px" }
    );
    io.observe(bottomLine);
  }
}

const imageList = new ImageList();

searchButton.addEventListener("click", async () => {
  imageList.observe();
});
