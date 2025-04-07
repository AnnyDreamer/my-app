"use client";
import { useState } from "react";

const dataInfo = [
  { label: "名字", key: "name" },
  { label: "姓氏", key: "lastName" },
];

export function StateStudy() {
  const [reverse, setReverse] = useState(false);
  const resultList = reverse ? [...dataInfo].reverse() : dataInfo;
  const checkbox = (
    <label>
      <input
        type="checkbox"
        checked={reverse}
        onChange={(e) => setReverse(e.target.checked)}
      />
      调换顺序
    </label>
  );
  return (
    <div className="flex flex-col gap-y-2 mt-2">
      {resultList.map((item) => {
        // 使用 key 来标识组件 当顺序改变时 指定一个不同的 key 来重置它的 state
        return <Field label={item.label} key={item.key} />;
      })}
      {checkbox}
    </div>
  );
}

function Field({ label }) {
  const [text, setText] = useState("");
  return (
    <label>
      {label}：
      <input
        type="text"
        value={text}
        placeholder={label}
        onChange={(e) => setText(e.target.value)}
      />
    </label>
  );
}

// 复杂组件
function ContactList({ contacts, selectedId, onSelect }) {
  return (
    <section>
      <ul className="flex gap-x-4 mt-4">
        {contacts.map((contact) => (
          <li key={contact.id}>
            <button
              onClick={() => {
                onSelect(contact.id);
              }}
            >
              {contact.id === selectedId ? <b>{contact.name}</b> : contact.name}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

function EditContact({ initialData, onSave }) {
  const [name, setName] = useState(initialData.name);
  const [email, setEmail] = useState(initialData.email);
  return (
    <section className="flex flex-col gap-y-2 mt-2 items-start">
      <label>
        名称：
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </label>
      <label>
        邮箱：
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </label>
      <button
        onClick={() => {
          const updatedData = {
            id: initialData.id,
            name: name,
            email: email,
          };
          onSave(updatedData);
        }}
      >
        保存
      </button>
      <button
        onClick={() => {
          setName(initialData.name);
          setEmail(initialData.email);
        }}
      >
        重置
      </button>
    </section>
  );
}

interface initialContactsType {
  id: number;
  name: string;
  email: string;
}

const initialContacts: initialContactsType[] = [
  { id: 0, name: "Taylor", email: "taylor@mail.com" },
  { id: 1, name: "Alice", email: "alice@mail.com" },
  { id: 2, name: "Bob", email: "bob@mail.com" },
];

export function ContactManager() {
  const [contacts, setContacts] = useState(initialContacts);
  const [selectedId, setSelectedId] = useState(0);
  const selectedContact = contacts.find((c) => c.id === selectedId);

  function handleSave(updatedData: initialContactsType) {
    const nextContacts = contacts.map((c) => {
      if (c.id === updatedData.id) {
        return updatedData;
      } else {
        return c;
      }
    });
    setContacts(nextContacts);
  }




  return (
    <div>
      <ContactList
        contacts={contacts}
        selectedId={selectedId}
        onSelect={(id) => setSelectedId(id)}
      />
      <hr />
      <EditContact
        initialData={selectedContact}
        onSave={handleSave}
        key={selectedContact?.id}
      />
    </div>
  );
}
