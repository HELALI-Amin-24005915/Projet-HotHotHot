"use strict";
/* eslint-disable no-unused-vars */

class TabsManual {
  constructor(O_groupNode) {
    this.tablistNode = O_groupNode;

    this.tabs = [];

    this.firstTab = null;
    this.lastTab = null;

    this.tabs = Array.from(this.tablistNode.querySelectorAll("[role=tab]"));
    this.tabpanels = [];

    for (let I_i = 0; I_i < this.tabs.length; I_i += 1) {
      const O_tab = this.tabs[I_i];
      const O_tabpanel = document.getElementById(O_tab.getAttribute("aria-controls"));

      O_tab.tabIndex = -1;
      O_tab.setAttribute("aria-selected", "false");
      this.tabpanels.push(O_tabpanel);

      O_tab.addEventListener("keydown", this.onKeydown.bind(this));
      O_tab.addEventListener("click", this.onClick.bind(this));

      if (!this.firstTab) {
        this.firstTab = O_tab;
      }
      this.lastTab = O_tab;
    }

    this.setSelectedTab(this.firstTab);
  }

  setSelectedTab(O_currentTab) {
    for (let I_i = 0; I_i < this.tabs.length; I_i += 1) {
      const O_tab = this.tabs[I_i];
      if (O_currentTab === O_tab) {
        O_tab.setAttribute("aria-selected", "true");
        O_tab.removeAttribute("tabindex");
        this.tabpanels[I_i].classList.remove("is-hidden");
      } else {
        O_tab.setAttribute("aria-selected", "false");
        O_tab.tabIndex = -1;
        this.tabpanels[I_i].classList.add("is-hidden");
      }
    }
  }

  moveFocusToTab(O_currentTab) {
    O_currentTab.focus();
  }

  moveFocusToPreviousTab(O_currentTab) {
    let I_index;

    if (O_currentTab === this.firstTab) {
      this.moveFocusToTab(this.lastTab);
    } else {
      I_index = this.tabs.indexOf(O_currentTab);
      this.moveFocusToTab(this.tabs[I_index - 1]);
    }
  }

  moveFocusToNextTab(O_currentTab) {
    let I_index;

    if (O_currentTab === this.lastTab) {
      this.moveFocusToTab(this.firstTab);
    } else {
      I_index = this.tabs.indexOf(O_currentTab);
      this.moveFocusToTab(this.tabs[I_index + 1]);
    }
  }

  /* EVENT HANDLERS */

  onKeydown(O_event) {
    const O_tgt = O_event.currentTarget;
    let B_flag = false;

    switch (O_event.key) {
      case "ArrowLeft":
        this.moveFocusToPreviousTab(O_tgt);
        B_flag = true;
        break;

      case "ArrowRight":
        this.moveFocusToNextTab(O_tgt);
        B_flag = true;
        break;

      case "Home":
        this.moveFocusToTab(this.firstTab);
        B_flag = true;
        break;

      case "End":
        this.moveFocusToTab(this.lastTab);
        B_flag = true;
        break;

      default:
        break;
    }

    if (B_flag) {
      O_event.stopPropagation();
      O_event.preventDefault();
    }
  }

  onClick(O_event) {
    this.setSelectedTab(O_event.currentTarget);
  }
}

window.addEventListener("load", function () {
  const A_tablists = document.querySelectorAll("[role=tablist].manual");
  for (let I_i = 0; I_i < A_tablists.length; I_i++) {
    new TabsManual(A_tablists[I_i]);
  }
});