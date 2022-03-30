/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

/*
 * Marquee - v0.0.1
 */

function decorateButtons(el) {
  const buttons = el.querySelectorAll('em a, strong a');
  buttons.forEach((button) => {
      const parent = button.parentElement;
      const buttonType = parent.nodeName === 'STRONG' ? 'blue' : 'outline';
      button.classList.add('con-button', buttonType);
      parent.insertAdjacentElement('afterend', button);
      parent.remove();
  });
  if (buttons.length > 0) {
      buttons[0].closest('p').classList.add('action-area');
  }
}

function decorateImages(el) {

}
function decorateText(el) {
  const headings = el.querySelectorAll('h1, h2, h3, h4, h5, h6');
  const heading = headings[headings.length - 1];
  heading.classList.add('heading-XL');
  heading.nextElementSibling.classList.add('body-M');
  if (heading.previousElementSibling) {
      heading.previousElementSibling.classList.add('detail-M');
  }
}

export default function init(el) {
  const wrapper = el.querySelector(':scope > div');
  const container = el.querySelector(':scope > div > div');

  // get rid of wrapper
  const fragment = document.createDocumentFragment();
  while (wrapper.firstChild) {
      fragment.appendChild(wrapper.firstChild);
  }
  wrapper.parentNode.replaceChild(fragment, wrapper);

  container.classList.add('foreground', 'container');
  const rows = container.querySelectorAll(':scope > p:not([class])');
  if (rows.length > 1) {
      const row0Img = rows[0].querySelector(':scope img');
      const row1Img = rows[1].querySelector(':scope img');

      const imgDiv = document.createElement('div');
      imgDiv.classList.add('image');

      // If rows 0 and 1 both have images?
      if(row0Img && row1Img) {
          const bg = document.createElement('div');
          bg.classList.add('background');
          bg.innerHTML += rows[0].innerHTML;
          el.prepend(bg);
          rows[0].remove();

          imgDiv.innerHTML += rows[1].innerHTML;
          rows[1].remove();

       // If only row 0 has an image?
      }else if (row0Img && !row1Img) {
          imgDiv.innerHTML += rows[0].innerHTML;
          rows[0].remove();
      }

      const textDiv = document.createElement('div');
      textDiv.classList.add('text');
      textDiv.innerHTML += container.innerHTML;

      container.innerHTML = '';
      container.appendChild(textDiv);
      container.appendChild(imgDiv);
  }

  decorateButtons(container);
  decorateText(container);
  // decorateImages(text);
}