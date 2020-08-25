var budgetController = (function () {
  var Expense = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };

  Expense.prototype.calcPercentage = function (totalIncome) {
    if (totalIncome > 0) {
      this.percentage = Math.round((this.value / totalIncome) * 100);
    } else {
      this.percentage = -1;
    }
  };

  Expense.prototype.getPercentage = function () {
    return this.percentage;
  };

  var Income = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  var caluculateTotal = function (type) {
    var sum = 0;
    data.allItems[type].forEach((cur) => {
      sum += cur.value;
    });
    data.totals[type] = sum;
  };

  var data = {
    allItems: {
      exp: [],
      inc: [],
    },
    totals: {
      exp: 0,
      inc: 0,
    },
    budget: 0,
    percentage: -1,
  };

  return {
    addItem: function (type, des, val) {
      var newItem, Id;
      //to give id to the new element based on last elemenT id + 1
      if (data.allItems[type].length > 0) {
        Id = data.allItems[type][data.allItems[type].length - 1].id + 1;
      } else {
        Id = 0;
      }
      if (type === "exp") {
        newItem = new Expense(Id, des, val);
      } else if (type === "inc") {
        newItem = new Income(Id, des, val);
      }
      data.allItems[type].push(newItem);
      return newItem;
    },

    deleteItem: function (type, id) {
      var ids, index;
      ids = data.allItems[type].map(function (current) {
        return current.id;
      });

      index = ids.indexOf(id);
      if (index !== -1) {
        data.allItems[type].splice(index, 1);
      }
    },

    caluculateBudget: function () {
      //calc total income and expense
      caluculateTotal("exp");
      caluculateTotal("inc");

      //calc the budget:income-expense
      data.budget = data.totals.inc - data.totals.exp;

      //cal % of income that we spent
      if (data.totals.inc > 0) {
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
      } else {
        data.percentage = -1;
      }
    },

    calculatePercentages: function () {
      data.allItems.exp.forEach((cur) => {
        cur.calcPercentage(data.totals.inc);
      });
    },

    getPercentages: function () {
      var allPercentages = data.allItems.exp.map(function (cur) {
        return cur.getPercentage();
      });
      return allPercentages;
    },

    getBudget: function () {
      return {
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        percentage: data.percentage,
      };
    },

    testting: function () {
      console.log(data);
    },
  };
})();

var UIController = (function () {
  var domStrings = {
    inputType: ".add__type",
    inputDescription: ".add__description",
    inputValue: ".add__value",
    inputBtn: ".add__btn",
    incomeContainer: ".income__list",
    expensesContainer: ".expenses__list",
    budgetLabel: ".budget__value",
    incomeLabel: ".budget__income--value",
    expensesLabel: ".budget__expenses--value",
    percentageLabel: ".budget__expenses--percentage",
    container: ".container",
    expensesPercentageLabel: ".item__percentage",
    dateLabel: ".budget__title--month",
  };

  var formatNumber = (num, type) => {
    var numSplit, int, dec, sign;
    num = Math.abs(num);
    num = num.toFixed(2); //returns a string with 2 decimal points
    numSplit = num.split(".");
    int = numSplit[0];
    dec = numSplit[1];
    if (int.length > 3) {
      int = int.substr(0, int.length - 3) + "," + int.substr(int.length - 3, 3);
    }
    return (type === "exp" ? "-" : "+") + " " + int + "." + dec;
  };

  var nodeListForEach = function (list, callback) {
    for (var i = 0; i < list.length; i++) {
      callback(list[i], i);
    }
  };
  return {
    getinput: function () {
      return {
        type: document.querySelector(domStrings.inputType).value,
        description: document.querySelector(domStrings.inputDescription).value,
        value: parseFloat(document.querySelector(domStrings.inputValue).value),
      };
    },
    addListItem: function (obj, type) {
      //creating html string with placeholder tags
      var html, newHtml, element;
      if (type === "inc") {
        element = domStrings.incomeContainer;
        html =
          '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div> <div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      } else {
        element = domStrings.expensesContainer;
        html =
          '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      }
      newHtml = html.replace("%id%", obj.id);
      newHtml = newHtml.replace("%description%", obj.description);
      newHtml = newHtml.replace("%value%", formatNumber(obj.value, type));

      document.querySelector(element).insertAdjacentHTML("beforeend", newHtml);
    },
    deleteListItem: function (selectorId) {
      var el = document.getElementById(selectorId);
      el.parentNode.removeChild(el);
    },

    clearFields: function () {
      var fields, fieldsArr;
      fields = document.querySelectorAll(
        domStrings.inputDescription + "," + domStrings.inputValue
      );
      fieldsArr = Array.prototype.slice.call(fields);
      fieldsArr.forEach(function (current, index, array) {
        current.value = "";
      });
      fieldsArr[0].focus();
    },
    displayBudget: function (obj) {
      var type;
      obj.budget > 0 ? (type = "inc") : (type = "exp");
      document.querySelector(domStrings.budgetLabel).textContent = formatNumber(
        obj.budget,
        type
      );
      document.querySelector(domStrings.incomeLabel).textContent = formatNumber(
        obj.totalInc,
        "inc"
      );
      document.querySelector(
        domStrings.expensesLabel
      ).textContent = formatNumber(obj.totalExp, "exp");

      if (obj.percentage > 0) {
        document.querySelector(domStrings.percentageLabel).textContent =
          obj.percentage + "%";
      } else {
        document.querySelector(domStrings.percentageLabel).textContent = "---";
      }
    },

    displayPercentages: function (percentages) {
      var fields = document.querySelectorAll(
        domStrings.expensesPercentageLabel
      );

      nodeListForEach(fields, function (current, index) {
        if (percentages[index] > 0) {
          current.textContent = percentages[index] + "%";
        } else {
          current.textContent = "---";
        }
      });
    },

    displayMonth: function () {
      var now, year, month, months;
      now = new Date();
      months = [
        "JAN",
        "FEB",
        "MAR",
        "APR",
        "MAY",
        "JUN",
        "JUL",
        "AUG",
        "SEPT",
        "OCT",
        "NOV",
        "DEC",
      ];
      year = now.getFullYear();
      month = now.getMonth();
      document.querySelector(domStrings.dateLabel).textContent =
        months[month] + " " + year;
    },

    changeType: function () {
      var fields = document.querySelectorAll(
        domStrings.inputType +
          ',' +
          domStrings.inputDescription +
          ',' +
          domStrings.inputValue
      );

      nodeListForEach(fields, function (cur) {
        cur.classList.toggle("red-focus");
      });

      document.querySelector(domStrings.inputBtn).classList.toggle("red");
    },

    getDOMStrings: function () {
      return domStrings;
    },
  };
})();

var controller = (function (budgetCtrl, UICtrl) {
  var setupEventListeners = () => {
    var DOM = UICtrl.getDOMStrings();
    document.querySelector(DOM.inputBtn).addEventListener("click", ctrlAddItem);
    document.addEventListener("keypress", function (event) {
      if (event.keyCode === 13 || event.which === 13) {
        ctrlAddItem();
      }
    });

    document
      .querySelector(DOM.container)
      .addEventListener("click", ctrlDeleteItem);

    document
      .querySelector(DOM.inputType)
      .addEventListener("change", UICtrl.changeType);
  };

  var updateBudget = function () {
    // 1.Calc the budget
    budgetCtrl.caluculateBudget();
    //2.return the budget
    var budget = budgetCtrl.getBudget();
    //3.display
    UICtrl.displayBudget(budget);
  };

  var updatePercentages = function () {
    //calc percentages
    budgetCtrl.calculatePercentages();
    //Read percentages from BudgetController
    var percentages = budgetCtrl.getPercentages();
    //update UI
    UICtrl.displayPercentages(percentages);
  };

  var ctrlAddItem = () => {
    var input, newItem;
    //Get Input
    input = UICtrl.getinput();
    if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
      //2.Add item to budget
      newItem = budgetCtrl.addItem(input.type, input.description, input.value);
      //3.Add item to UI
      UICtrl.addListItem(newItem, input.type);
      //Clear fields
      UICtrl.clearFields();
      //Calc and update budget
      updateBudget();
      //Calc and update percentages
      updatePercentages();
    }
  };
  var ctrlDeleteItem = (event) => {
    var itemID, splitID, type, ID;
    itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
    if (itemID) {
      splitID = itemID.split("-");
      type = splitID[0];
      ID = parseInt(splitID[1]);
      //delete item from DS
      budgetCtrl.deleteItem(type, ID);
      //delete item from UI
      UICtrl.deleteListItem(itemID);
      //Update budget
      updateBudget();
      //Calc and update percentages
      updatePercentages();
    }
  };
  return {
    init: function () {
      console.log("App has start");
      UICtrl.displayMonth();
      var obj = {
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        percentage: -1,
      };
      UICtrl.displayBudget(obj);
      setupEventListeners();
    },
  };
})(budgetController, UIController);

controller.init();
/*
var budgetController = (function(){
    var x = 23;

    var add = function(a){
        return x+a;
    }

    return {
        publicTest : function (b) {
            return add(b);
        }
    }
})();

var UIController = (function () {
    //some code
})();

var controller = (function (budgetCtrl,UICtrl) {
    var z = budgetCtrl.publicTest(6);
    return {
        anotherpublic: function () {
            console.log(z);
        }
    }
})(budgetController,UIController);
 */
