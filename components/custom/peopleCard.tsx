"use client";

import * as React from "react";
import { getImageUrl } from "../../lib/utils";
import { useState } from "react";

// 使用map创建元素时 需要给每一个元素制定一个唯一的key 用来标识该元素，如果用户没有指定，则默认使用数据的index索引
// key使得react在进行增删改时 能够匹配到具体元素 及在state变动时 更高效率的更新dom
// ⚠️：使用index来标识元素一般不可取 对数据进行操作时 可能会改变数据的index 产生微妙的bug

export function Gallery() {
  const options = infoData;
  const content = options.map((item, index) => {
    return (
      <section className="profile" key={index}>
        <h2>{item.name}</h2>
        <img
          className="avatar"
          src={getImageUrl(item.imgUrl)}
          alt={item.name}
          width={70}
          height={70}
        />
        {InfoList({ options: item.details })}
      </section>
    );
  });
  return (
    <div>
      <h1>Notable Scientists</h1>
      {content}
    </div>
  );
}

interface info {
  title: string;
  content: string;
}

function InfoList({ options }) {
  // 以 use 开头的函数都被称为 hook，只能在组件或自定义 Hook 的最顶层调用，
  // 不可以用在条件语句、循环语句或其他函数中嵌套

  // state被精准更新的逻辑： 在 React 内部，为每个组件保存了一个数组，
  // 其中每一项都是一个 state对。state[] \ setters[] ，按照顺序存放，它维护当前 state 对的索引值，在渲染之前将其设置为 “0”。
  // 每次调用 useState 时，React 都会为你提供一个 state 对并增加索引值。
  // react是按照顺序渲染 更新数据的 ，如果在条件语句或者循环中使用，则可能导致值更新的问题

  // state 完全私有于声明它的组件。父组件无法更改，同类型组件被两次渲染，数据也是独立的，也不会相互影响

  // react 不支持直接修改state中存储的值
  // const [objState, setObjState] = useState({ a: 12, b: 34 });
  // // objState.a = 24 不支持直接修改
  // const obj1 = objState;
  // obj1.a = 24;
  // setObjState(obj1);

  // 引入插件 Immer插件
  // const [obj2State, updateObj2State] = useImmer({ a: 12, b: 34 });
  // updateObj2State((heihei) => {
  //   heihei.a = 16;
  // });

  const [currentInfo, setCurrentInfo] = useState("");

  // 组件props传递过来的值最好不要使用 state hook包裹 因为组件渲染时 useState只会赋值一次 父组件props改变 不会触发更新渲染

  const list = options.map((item: info, index: number) => {
    return (
      <li key={index} onClick={() => clickLine(item)}>
        <b>{item.title}：</b>
        {item.content}
      </li>
    );
  });

  function clickLine({ title, content }: info) {
    // alert(title + "：" + content);
    setCurrentInfo(title + "：" + content);
    // title === 为改变的title
    // React 会等到事件处理函数中的 所有代码都运行完毕再处理 state 更新
    // setCurrentInfo  state调用setters只会在react下一次渲染的时被更改  在一次渲染的内部，该state的值不会变

    // 优点：可以更新多个state变量 但不触发多次dom重新渲染更新

    // 函数形式 -- 事件处理函数
    // 可以多次更新state数值 --- 批处理
    setCurrentInfo((title) => title + "：" + content + "heihei");

    alert(title);
  }

  return (
    <div>
      <b>{currentInfo}</b>
      <ul>{list}</ul>
    </div>
  );
}

import { sculptureList, infoData } from "./people";
import { Button } from "../ui/button";
import { useImmer } from "use-immer";

export function IntroInfo() {
  const [index, setIndex] = useState(0);
  const [showMore, setShowMore] = useState(false);

  function handleNextClick({ action }) {
    if (index === sculptureList.length - 1 && action === "next") {
      setIndex(0);
    } else if (index === 0 && action == "prev") {
      setIndex(sculptureList.length - 1);
    } else {
      setIndex(action === "next" ? index + 1 : index - 1);
    }
  }

  function handleMoreClick() {
    setShowMore(!showMore);
  }

  const sculpture = sculptureList[index];
  return (
    <>
      <Button
        onClick={() => handleNextClick({ action: "next" })}
        className="mr-4"
      >
        Next
      </Button>
      <Button onClick={() => handleNextClick({ action: "prev" })}>Prev</Button>
      <h2>
        <i>{sculpture.name} </i>
        by {sculpture.artist}
      </h2>
      <h3>
        ({index + 1} of {sculptureList.length})
      </h3>
      <button onClick={handleMoreClick}>
        {showMore ? "Hide" : "Show"} details
      </button>
      {showMore && <p>{sculpture.description}</p>}
      <img src={sculpture.url} alt={sculpture.alt} />
    </>
  );
}
