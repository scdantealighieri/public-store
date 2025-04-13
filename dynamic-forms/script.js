document.addEventListener("DOMContentLoaded", function () {
  initializeChoices();
  setTimeout(initializeChoices, 1000);
});

function initializeChoices() {
  if (!window.jQuery) {
    console.log("Backbone not available");
    return;
  }

  const danteDivs = document.querySelectorAll("div[class*='dante-']");

  if (danteDivs.length === 0) {
    console.log("No divs with dante- classes found. Skipping API call.");
    return;
  }

  const danteSelects = [];
  danteDivs.forEach((div) => {
    const selects = div.querySelectorAll("select");
    selects.forEach((select) => danteSelects.push(select));
  });

  if (danteSelects.length === 0) {
    console.log(
      "No select fields inside dante- divs found. Skipping API call."
    );
    return;
  }

  fetch("https://dantealighieri.appblue.pl/api/get_groups.php")
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then((groups) => {
      danteSelects.forEach((select) => {
        let parentDiv = select.closest("div[class*='dante-']");
        if (!parentDiv) return;

        const classList = parentDiv.className.split(" ");

        let filteredGroups = [...groups];

        for (const className of classList) {
          if (className.startsWith("dante-")) {
            const filterParts = className.split("-");
            if (filterParts.length >= 3) {
              const filterType = filterParts[1];
              const filterValue = filterParts[2];

              switch (filterType) {
                case "level":
                  filteredGroups = filteredGroups.filter(
                    (group) =>
                      group.groupLevel &&
                      group.groupLevel
                        .toLowerCase()
                        .trim()
                        .startsWith(filterValue.toLowerCase())
                  );
                  break;
                case "type":
                  filteredGroups = filteredGroups.filter(
                    (group) =>
                      group.groupType &&
                      group.groupType
                        .toLowerCase()
                        .trim()
                        .startsWith(filterValue.toLowerCase())
                  );
                  break;
              }
            }
          }
        }

        const choicesData = filteredGroups.map((group) => ({
          value: group.groupName,
          label: group.groupName,
        }));

        try {
          const choices = jQuery(`#${select.id}`).data("choicesjs");
          if (choices && typeof choices.setChoices === "function") {
            choices.setChoices(choicesData, "value", "label", true);
            console.log(
              `Custom choices set successfully for select #${select.id}`
            );
          } else {
            console.log(
              `Choices.js instance not found or setChoices method not available for select #${select.id}`
            );
          }
        } catch (error) {
          console.error(
            `Error setting choices for select #${select.id}:`,
            error
          );
        }
      });
    })
    .catch((error) => {
      console.error("Error fetching group data:", error);
    });
}
