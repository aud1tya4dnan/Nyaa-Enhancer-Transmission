<div id="top"></div>

<!-- PROJECT SHIELDS -->
<!--
*** I'm using markdown "reference style" links for readability.
*** Reference links are enclosed in brackets [ ] instead of parentheses ( ).
*** See the bottom of this document for the declaration of the reference variables
*** for contributors-url, forks-url, etc. This is an optional, concise syntax you may use.
*** https://www.markdownguide.org/basic-syntax/#reference-style-links
-->

[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/Arad119/Nyaa-Magnet-Helper">
    <img src="images/Logo.png" alt="Logo" width="80" height="80">
  </a>

<h3 align="center">Nyaa Magnet Helper</h3>

  <p align="center">
    A browser extension that enhances Nyaa torrent sites with checkbox functionality to easily select and copy multiple magnet links at once.
  </p>
</div>

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
        <li><a href="#features">Features</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#installation">Installation</a></li>
        <li><a href="#usage">Usage</a></li>
      </ul>
    </li>
    <li><a href="#license">License</a></li>
  </ol>
</details>

<!-- ABOUT THE PROJECT -->

## About The Project

![Nyaa-Magnet-Helper Screenshot][product-screenshot]

Nyaa Magnet Helper is a browser extension that adds convenient functionality to Nyaa torrent sites. It allows users to select multiple magnet links using checkboxes and copy them all at once, making it easier to manage multiple downloads.

<p align="right">(<a href="#top">back to top</a>)</p>

### Built With

- [Chrome Extensions API](https://developer.chrome.com/docs/extensions/reference/api)

<p align="right">(<a href="#top">back to top</a>)</p>

<!-- FEATURES -->

### Features

![Nyaa-Magnet-Helper Preview][product-preview]

- Adds checkboxes next to each torrent entry
- "Copy Selected" button to copy checked magnet links
- "Copy All" button to copy all magnet links
- "Download Selected" button to download checked torrent files
- "Download All" button to download all torrent files
- "Clear Selection" button to uncheck all boxes
- Selection counter showing number of selected items
- Toast notifications with progress tracking
- Customizable file options:
  - Use anime titles as torrent filenames
  - Combine downloads into ZIP files
- Settings sync across sessions
- Supports multiple Nyaa mirror domains

<p align="right">(<a href="#top">back to top</a>)</p>

<!-- GETTING STARTED -->

## Getting Started

To install the extension in your browser, follow these steps.

### Installation

**Chrome Web Store:**  
<a href="https://chromewebstore.google.com/detail/nyaa-magnet-helper/donibkpnifppkihgmnoocogmmbbocpdd" target="_blank">
 <img src="https://developer.chrome.com/static/docs/webstore/branding/image/HRs9MPufa1J1h5glNhut.png" alt="Chrome Web Store" height="50px" >
</a>    
  

**Firefox Add-Ons Store:**  
<a href="https://addons.mozilla.org/en-US/firefox/addon/nyaa-enhancer/" target="_blank">
 <img src="https://extensionworkshop.com/assets/img/documentation/publish/get-the-addon-178x60px.dad84b42.png" alt="Firefox Add-Ons Store" height="50px" >
</a>    
  

**Edge Add-Ons Store:**  
<a href="https://microsoftedge.microsoft.com/addons/detail/nyaa-magnet-helper/cpkcppifogblfgbggdeljjnibjfcdakf" target="_blank">
 <img src="https://developer.microsoft.com/store/badges/images/English_get-it-from-MS.png" alt="Edge Add-Ons Store" height="50px" >
</a>    
  
  
**Download extension files locally:**
1. Download the extension files or clone the repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension directory

### Usage

1. Visit any supported Nyaa torrent site
2. Use the checkboxes to select desired torrents
3. Click "Copy Selected" to copy selected magnet links
4. Click "Copy All" to copy all magnet links
5. Use "Clear Selection" to uncheck all boxes
6. Watch for toast notifications confirming actions

The extension works on the following domains:

- nyaa.si
- nyaa.eu
- nya.iss.one
- nyaa.ink
- nyaa.land
- nyaa.digital
- ny.iss.one

<p align="right">(<a href="#top">back to top</a>)</p>

<!-- LICENSE -->

## License

Distributed under the MIT License. See `LICENSE.txt` for more information.

<p align="right">(<a href="#top">back to top</a>)</p>

<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->

[contributors-shield]: https://img.shields.io/github/contributors/Arad119/Nyaa-Magnet-Helper.svg?style=for-the-badge
[contributors-url]: https://github.com/Arad119/Nyaa-Magnet-Helper/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/Arad119/Nyaa-Magnet-Helper.svg?style=for-the-badge
[forks-url]: https://github.com/Arad119/Nyaa-Magnet-Helper/network/members
[stars-shield]: https://img.shields.io/github/stars/Arad119/Nyaa-Magnet-Helper.svg?style=for-the-badge
[stars-url]: https://github.com/Arad119/Nyaa-Magnet-Helper/stargazers
[issues-shield]: https://img.shields.io/github/issues/Arad119/Nyaa-Magnet-Helper.svg?style=for-the-badge
[issues-url]: https://github.com/Arad119/Nyaa-Magnet-Helper/issues
[license-shield]: https://img.shields.io/github/license/Arad119/Nyaa-Magnet-Helper.svg?style=for-the-badge
[license-url]: https://github.com/Arad119/Nyaa-Magnet-Helper/blob/master/LICENSE.txt
[product-screenshot]: images/Program.png
[product-preview]: images/Screenshot.png
