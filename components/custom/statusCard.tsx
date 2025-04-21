"use client";
import * as React from "react";
import { useState, createContext, useContext } from "react";
import { Input } from "@/components/ui/input";
import styles from "@/styles/contact.module.css";
import { UserPanle } from "./peopleCard";
import Link from "next/link";
import { ThemeToggle } from "../ThemeToggle";

const userContext = createContext({ name: "hi~", id: "1", describe: "hahha" });

// 复杂组件
interface Contact {
  id: number;
  name: string;
}

interface ContactListProps {
  contacts: Contact[];
  selectedId: number;
  onSelect: (id: number) => void;
}

function ContactList({ contacts, selectedId, onSelect }: ContactListProps) {
  return (
    <section>
      <ul className="flex flex-col gap-x-4">
        {contacts.map((contact) => (
          <li key={contact.id}>
            <Link
              href={`/contacts/${contact.id}`}
              onClick={() => onSelect(contact.id)}
              className="block w-full text-left hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded text-gray-900 dark:text-gray-100"
            >
              {contact.id === selectedId ? <b>{contact.name}</b> : contact.name}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function EditContact({ initialData }) {
  const [name, setName] = useState(initialData.name);
  const [email, setEmail] = useState(initialData.email);
  return (
    <div className="flex flex-col gap-y-2 mt-2 items-start">
      <label className="text-gray-900 dark:text-gray-100">名称：</label>
      <Input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700"
      />
      <label className="text-gray-900 dark:text-gray-100">邮箱：</label>
      <Input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700"
      />
    </div>
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

export function AddContact() {
  const userInfo = useContext(userContext);
  const [contacts, setContacts] = useState(initialContacts);
  const [selectedId, setSelectedId] = useState(0);
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <ThemeToggle />
      <UserPanle userInfo={userInfo} />
      <div
        className={`mt-2 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700`}
      >
        <ContactList
          contacts={contacts}
          selectedId={selectedId}
          onSelect={(id) => setSelectedId(id)}
        />
      </div>
    </div>
  );
}
