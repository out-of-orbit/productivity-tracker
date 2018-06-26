// Local Storage Controller

const LSCtrl = (function() {

  return {
    storeItem: function(item) {
      let items;
      if(localStorage.getItem('items') === null) {
        items = [];
        items.push(item);
        localStorage.setItem('items', JSON.stringify(items));
      } else {
        items = JSON.parse(localStorage.getItem('items'));
        items.push(item);
        localStorage.setItem('items', JSON.stringify(items));
      }
    }, 
    getItemsFromStorage: function() {
      let items;
      if(localStorage.getItem('items') === null) {
        items = [];
      } else {
        items = JSON.parse(localStorage.getItem('items'));
      }
      return items;
    },
    deleteStorageItem: function(id) {
      let items = JSON.parse(localStorage.getItem('items'));
      items.forEach(function(item, index) {
        if(id === item.id) {
          items.splice(index, 1);
        }
      });
      localStorage.setItem('items', JSON.stringify(items));
    }
  }
})();

// Data Controller

const ItemCtrl = (function() {

  const Item = function(id, type, desc, hours) {
    this.id = id;
    this.type = type;
    this.desc = desc;
    this.hours = hours;
  };

  const data = {
    items: LSCtrl.getItemsFromStorage(),
    totalProdHours: 0,
    totalNonprodHours: 0,
    currentItem: null
  };

  return {
    getItems: function() {
      return data.items;
    },
    addItem: function(type, desc, hours) {
      let ID;
      if(data.items.length > 0) {
        ID = data.items.length;
      } else {
        ID = 0;
      };
      hours = parseInt(hours);
      newItem = new Item(ID, type, desc, hours);
      data.items.push(newItem);
      return newItem;
    },
    getTotalPH: function() {
      const itemsP = data.items.filter(item => item.type === 'P');
      let total = 0;
      itemsP.forEach(function(item) {
        total += item.hours;
      })
      data.totalProdHours = total;
      return data.totalProdHours;
    },
    getTotalNH: function() {
      const itemsN = data.items.filter(item => item.type === 'N');
      let total = 0;
      itemsN.forEach(function(item) {
        total += item.hours;
      })
      data.totalNonprodHours = total;
      return data.totalNonprodHours;
    },
    getById: function(id) {
      let result = null;
      data.items.forEach(function(item) {
        if(item.id === id) {
          result = item;
        }
      });
      return result;
    },
    setCI: function(curItem) {
      data.currentItem = curItem;
    },
    getCI: function() {
      return data.currentItem;
    },
    deleteItem: function(id) {
      const ids = data.items.map(function(item) {
        return item.id;
      });
      const index = ids.indexOf(id);
      data.items.splice(index, 1);
    },
    logData: function() {
      return data;
    }
  }
})();

// UI Controller

const UICtrl = (function() {

  const UISelectors = {
    addBtn: '#add',
    itemDesc: '#description',
    itemType: '#type',
    itemHours: '#hr',
    listP: '#listP',
    listN: '#listN',
    totalPhours: '#phours',
    totalNhours: '#nhours',
    itemList: 'ul li',
    totalPHpercent: '#perP',
    totalHHpercent: '#perN'
  };

  return {
    showItemsList: function(items) {
      let outputP = '';
      const itemsP = items.filter(item => item.type === 'P');
      if(itemsP.length !== 0) {
        itemsP.forEach(function(itemP) {
          outputP += `
          <li id="item-${itemP.id}">${itemP.desc}:  <span>${itemP.hours} hr<a class="delete" href="#">&times;</a></span></li>
          `;
        });
        document.querySelector(UISelectors.listP).innerHTML = outputP;
      }
      let outputN = '';
      const itemsN = items.filter(item => item.type === 'N');
      if(itemsN.length !== 0) {
        itemsN.forEach(function(itemN) {
          outputN += `
          <li id="item-${itemN.id}">${itemN.desc} <span>${itemN.hours} hr<a class="delete" href="#">&times;</a></span></li>
          `;
        });
        document.querySelector(UISelectors.listN).innerHTML = outputN;
      }
    },
    getInput: function() {
      return {
      desc: document.querySelector(UISelectors.itemDesc).value,
      type: document.querySelector(UISelectors.itemType).value,
      hours: document.querySelector(UISelectors.itemHours).value
      }
    },
    clearInput: function() {
      document.querySelector(UISelectors.itemDesc).value = '';
      document.querySelector(UISelectors.itemHours).value = '';
    },
    addItemUI: function(item) {
      const li = document.createElement('li');
      li.id = `item-${item.id}`;
      li.innerHTML = `${item.desc} <span>${item.hours} hr<a class="delete" href="#">&times;</a></span>`;
      if(item.type === 'P') {
        document.querySelector(UISelectors.listP).insertAdjacentElement('beforeend', li); 
      } else {
        document.querySelector(UISelectors.listN).insertAdjacentElement('beforeend', li); 
      }
    },
    getTotal: function() {
      const totalN = ItemCtrl.getTotalNH();
      const totalP = ItemCtrl.getTotalPH();
      const totalHours = totalN + totalP;
      return totalHours;
    },
    showTotalPHours: function(hours) {
      document.querySelector(UISelectors.totalPhours).innerHTML = `${hours} hrs.`;
      const ratioP = Math.round((hours/UICtrl.getTotal()) * 100); 
      document.querySelector(UISelectors.totalPHpercent).innerHTML = `${ratioP} %`;
    },
    showTotalNHours: function(hours) {
      document.querySelector(UISelectors.totalNhours).innerHTML = `${hours} hrs.`;
      const ratioN = Math.round((hours/UICtrl.getTotal()) * 100); 
      document.querySelector(UISelectors.totalHHpercent).innerHTML = `${ratioN} %`;
    },
    deleteItemUI: function(id) {
      const itemId = `#item-${id}`;
      const item = document.querySelector(itemId);
      item.remove();
    },
    getSelectors: function() {
      return UISelectors;
    }
  }
})();

// Main Controller

const AppCtrl = (function(LSCtrl, ItemCtrl, UICtrl) {

  const loadEventListeners = function() {
    const UISelectors = UICtrl.getSelectors();
    document.querySelector(UISelectors.addBtn).addEventListener('click', addItemClick);
    document.querySelector(UISelectors.listP).addEventListener('click', deleteItemClick);
    document.querySelector(UISelectors.listN).addEventListener('click', deleteItemClick);
  }

  const addItemClick = function(e) {
    const input = UICtrl.getInput();
    if(input.desc !== '' && input.hours !== '') {
      const newItem = ItemCtrl.addItem(input.type, input.desc, input.hours);
      UICtrl.addItemUI(newItem);
      const getPhours = ItemCtrl.getTotalPH();
      UICtrl.showTotalPHours(getPhours);
      const getNhours = ItemCtrl.getTotalNH();
      UICtrl.showTotalNHours(getNhours);
      LSCtrl.storeItem(newItem);
      UICtrl.clearInput();
    }
    e.preventDefault();
  }

  const deleteItemClick = function(e) {
    if(e.target.classList.contains('delete')) {
      const listId = e.target.parentNode.parentNode.id;
      const idArr = listId.split('-');
      const id = parseInt(idArr[1]);
      const getItem = ItemCtrl.getById(id);
      ItemCtrl.setCI(getItem);
      const currentItem = ItemCtrl.getCI();
      ItemCtrl.deleteItem(currentItem.id);
      LSCtrl.deleteStorageItem(currentItem.id);
      UICtrl.deleteItemUI(currentItem.id);
      const getPhours = ItemCtrl.getTotalPH();
      UICtrl.showTotalPHours(getPhours);
      const getNhours = ItemCtrl.getTotalNH();
      UICtrl.showTotalNHours(getNhours);
    }
    e.preventDefault();
  }

  return {
    init: function() {
      const items = ItemCtrl.getItems();
      if(items.length !== 0) {
        UICtrl.showItemsList(items);
      }
      const getTotalPHours = ItemCtrl.getTotalPH();
      UICtrl.showTotalPHours(getTotalPHours);
      const getTotalNHours = ItemCtrl.getTotalNH();
      UICtrl.showTotalNHours(getTotalNHours);
      loadEventListeners();
      console.log(UICtrl.getTotal());
    }
  }
})(LSCtrl, ItemCtrl, UICtrl);

AppCtrl.init();