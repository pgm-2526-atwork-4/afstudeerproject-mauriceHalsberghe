"use client";
import { useState } from "react";
import { loginUser } from "@/lib/api";
import { useRouter } from "next/navigation";

import { useContext } from "react";
import { AuthContext } from "@/context/AuthContext";
import Link from "next/link";

import AuthStyles from '@/app/styles/pages/auth.module.css';
import ButtonStyles from '@/app/styles/components/button.module.css';

import LogoIcon from "@/public/mealio_logo.svg"

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  const auth = useContext(AuthContext);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
        const res = await loginUser(form);

        auth?.login(res.user, res.token);

        router.push("/");

    } catch (err: unknown) {
    if (err instanceof Error) {
        setError(err.message);
    } else {
        setError("Something went wrong");
    }
    }

  }

  return (
    <div className={AuthStyles.page}>
        <LogoIcon className={AuthStyles.logo} />
        <h1 className={AuthStyles.title}>Welcome to <span>Mealio</span></h1>
        <h2 className={AuthStyles.subtitle}>Log into your account</h2>

        <form className={AuthStyles.form} onSubmit={handleSubmit}>
            
            <div className={AuthStyles.inputs}>
                <label className={AuthStyles.label} htmlFor="email">
                    Email
                    <input
                        className={AuthStyles.input}
                        required
                        placeholder="Email"
                        type="email"
                        id="email"
                        onChange={(e) =>
                            setForm({ ...form, email: e.target.value })
                        }
                    />
                </label>

                <label className={AuthStyles.label} htmlFor="password">
                    Password
                    <input
                        className={AuthStyles.input}
                        required
                        placeholder="Password"
                        type="password"
                        id="password"
                        onChange={(e) =>
                            setForm({ ...form, password: e.target.value })
                    }
                    />
                </label>
            </div>

            <button className={ButtonStyles.button} type="submit">Login</button>
        </form>

        {error && <p className={AuthStyles.error}>{error}</p>}

        <p className={AuthStyles.text}>No account yet? <Link className={AuthStyles.link} href={'./register'}>Register</Link></p>
        <Link className={AuthStyles.link} href={'./'}>Continue as a Guest</Link>
    </div>
  );
}
