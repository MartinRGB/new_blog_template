import React, { createContext, useState } from "react";

export var SelectedTagContext = createContext({
  selectedTag: "all",
  hasSelectedTag: false,
  setSelectedTag: (tag: string) => {},
  getSelectedTag: () => {},

  // previousTag: 'all',
  // setPreviousTag: (tag: string) => {},
});

var SelectedTagProvider: React.FC<{}> = ({ children }) => {
  const initialSelectedTag = "all";

  const [selectedTag, setSelectedTag] = useState<string>(initialSelectedTag);
  const [hasSelectedTag, setHasSelectedTag] = useState<boolean>(false);

  function setSelectedTagAndSave(tag: string) {
    localStorage.setItem("selectedTag", tag || initialSelectedTag);
    setSelectedTag(tag);
    //setPreviousTagAndSave(tag);
  }

  function getSelectedTagAndSave() {
    setSelectedTag(localStorage.getItem("selectedTag") || initialSelectedTag);
    setHasSelectedTag(true);
  }

  // function setPreviousTagAndSave(tag: string) {
  //   localStorage.setItem("previousTag", tag);
  // }


  return (
    <SelectedTagContext.Provider
      value={{
        selectedTag,
        hasSelectedTag,
        setSelectedTag: setSelectedTagAndSave,
        getSelectedTag: getSelectedTagAndSave,

        // previousTag:localStorage.getItem("previousTag"),
        // setPreviousTag: setPreviousTagAndSave,
      }}
    >
      {children}
    </SelectedTagContext.Provider>
  );
};

export default SelectedTagProvider;