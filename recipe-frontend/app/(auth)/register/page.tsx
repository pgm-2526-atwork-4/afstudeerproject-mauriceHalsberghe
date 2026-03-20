"use client";
import { useState } from "react";
import { registerUser } from "@/lib/api";
import { useRouter } from "next/navigation";

import { useContext } from "react";
import { AuthContext } from "@/context/AuthContext";
import Link from "next/link";

import AuthStyles from '@/app/styles/pages/auth.module.css';
import ButtonStyles from '@/app/styles/components/button.module.css';
import Image from "next/image";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [errors, setErrors] = useState({
    username: "",
    email: "",
    password: "",
  });

  const auth = useContext(AuthContext);

  function validate() {
    const newErrors = { username: "", email: "", password: "" };
    let valid = true;

    if (form.username.trim().length < 3) {
      newErrors.username = "Username must be at least 3 characters";
      valid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email.trim())) {
      newErrors.email = "Please enter a valid email address";
      valid = false;
    }

    if (form.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    try {
      const res = await registerUser({
        username: form.username.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });

      auth?.login(res.user, res.token);

      router.push("/register/preferences");
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
      <Image className={AuthStyles.image} src={'/ingredients2.jpg'} alt="Ingredients" height={640} width={400} />
      <div className={AuthStyles.main}>
          <h1 className={AuthStyles.title}>Welcome to Mealio</h1>
          <h2 className={AuthStyles.subtitle}>Create an account</h2>

          <form className={AuthStyles.form} onSubmit={handleSubmit}>

            <div className={AuthStyles.inputs}>
              <label className={AuthStyles.label} htmlFor="username">
                Username
                <input
                  className={AuthStyles.input}
                  required
                  placeholder="Username"
                  id="username"
                  onChange={(e) => {
                    setForm({ ...form, username: e.target.value });
                    setErrors({ ...errors, username: "" });
                  }}
                />
                {errors.username && <p className={AuthStyles.error}>{errors.username}</p>}
              </label>
              
              <label className={AuthStyles.label} htmlFor="email">
                Email
                <input
                  className={AuthStyles.input}
                  type="email"
                  placeholder="Email"
                  id="email"
                  onChange={(e) => {
                    setForm({ ...form, email: e.target.value });
                    setErrors({ ...errors, email: "" });
                  }}
                />
                {errors.email && <p className={AuthStyles.error}>{errors.email}</p>}
              </label>

              <label className={AuthStyles.label} htmlFor="password">
                Password
                <input
                  className={AuthStyles.input}
                  placeholder="Password"
                  type="password"
                  id="password"
                  onChange={(e) => {
                    setForm({ ...form, password: e.target.value });
                    setErrors({ ...errors, password: "" });
                  }}
                />
                {errors.password && <p className={AuthStyles.error}>{errors.password}</p>}
              </label>
            </div>

            <button className={ButtonStyles.button} type="submit">Register</button>
            {error && <p className={AuthStyles.error}>{error}</p>}
          </form>


        <p className={AuthStyles.text}>Already an account? <Link className={AuthStyles.link} href={'/login'}>Log in</Link></p>

        <Link className={AuthStyles.link} href={'/'}>Continue as a Guest</Link>
      </div>
    </div>
  );
}
