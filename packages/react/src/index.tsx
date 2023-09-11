// TODO: idk why but this is not getting registered otherwise??
import React from "react";
import { useEffect, useRef, useState } from "react";
import { ElementInitializer, TagType } from "@playhtml/common";
// TODO: this probably doesn't work as it stands lol
// import { TagTypeToElement } from "../../playhtml/src/elements";
import { playhtml } from "playhtml";

// NOTE: localData is not included because you can handle that purely within your parent React component since it doesn't need to handle any
// syncing logic.
type ReactElementInitializer<T = any, V = any> = Omit<
  ElementInitializer<T, any, V>,
  "updateElement" | "defaultData" | "defaultLocalData" | "myDefaultAwareness"
> & {
  defaultData: T;
  myDefaultAwareness?: V;
  children: (defaultData: T, awareness: V[] | undefined) => React.ReactNode;
};

// TODO: make the mapping to for TagType -> ReactElementInitializer
export function Playable<T, V>({
  tagInfo,
  children,
  ...elementProps
}: ReactElementInitializer<T, V> & {
  tagInfo?: { [k in TagType]: string };
}) {
  const computedTagInfo = tagInfo || { "can-play": "" };
  const ref = useRef<HTMLElement>(null);
  const { defaultData, myDefaultAwareness } = elementProps;
  const [data, setData] = useState<T>(defaultData);
  const [awareness, setAwareness] = useState<V[]>(
    myDefaultAwareness ? [myDefaultAwareness] : []
  );

  // TODO: this is kinda a hack but it works for now since it is called whenever we set data.
  const updateElement: ElementInitializer["updateElement"] = ({
    data: newData,
    awareness: newAwareness,
  }) => {
    setData(newData);
    setAwareness(newAwareness);
  };

  useEffect(() => {
    if (ref.current) {
      for (const [key, value] of Object.entries(elementProps)) {
        // @ts-ignore
        ref.current[key] = value;
      }
      // @ts-ignore
      ref.current.updateElement = updateElement;
      // @ts-ignore
      ref.current.updateElementAwareness = updateElement;
      // TODO: how to handle if you are importing from unpkg too?
      playhtml.setupPlayElement(ref.current);
    }

    // TODO: remove play element when unmounted
    return () => playhtml.removePlayElement(ref.current);
  }, [elementProps]);

  // Pass data to children to render.. or what's the most reactive way to do this?
  // should user give a function to render children with the data + set data operations?
  return React.cloneElement(
    React.Children.only(children(data, awareness)) as any,
    {
      ref,
      ...computedTagInfo,
    }
  );
}

// export function Movable(props: PropsWithChildren<{}>) {
//   return (
//     <Playable
//       {...TagTypeToElement[TagType.CanMove]}
//       children={props.children}
//     />
//   );
// }
//TODO: export an equivalent element for each of the things in elements.ts?

export { playhtml };
