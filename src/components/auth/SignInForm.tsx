"use client";
import Checkbox from "@/components/form/input/Checkbox";
import Button from "@/components/ui/button/Button";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { loginValidation } from "@/validators/auth/login";
import InputLabel from "../form/FormInput";
import { z } from "zod";
import Loading from "../common/Loading";
import showToast from "@/utils/showToast";
import { AxiosError } from "axios";
import { useUser } from "@/context/UserContext";
import Image from "next/image";

type LoginFormData = z.infer<typeof loginValidation>;

export default function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isChecked, setIsChecked] = useState(false);
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const { login } = useUser();

  const { mutate: loginMutation, isPending: loading, isSuccess } = useMutation({
    mutationFn: async (data: LoginFormData) => {
      // Simulate login success
      await new Promise(resolve => setTimeout(resolve, 1000)); // Add mostly fake delay for better UX feel

      let response = {};
      const { username, password } = data;

      if (username === 'admin' && password === 'admin') {
        response = {
          data: {
            data: { id: 1, username: 'admin', name: 'Admin', role: 'admin', token: 'tokenss' }
          },
          message: 'Login success'
        }
      } else if (username === 'operator' && password === 'operator') {
        response = {
          data: {
            data: { id: 2, username: 'operator', name: 'Operator', role: 'operator', token: 'tokenss' }
          },
          message: 'Login success'
        }
      } else {
        throw new AxiosError("Invalid username or password", "401", undefined, undefined, {
          status: 401,
          statusText: "Unauthorized",
          headers: {},
          config: {} as any,
          data: { message: "Invalid username or password" }
        });
      }

      return response;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onSuccess: (response: any) => {
      const userData = response.data.data;
      const userToken = response.data.data.token;
      login(userData, userToken);
      toast.success(response.data.message || "Welcome back!");
      router.push(callbackUrl);
    },
    onError: (error: AxiosError<{ message: string }>) => {
      showToast(error.response?.data?.message ?? error.message ?? 'Terjadi kesalahan');
    }
  });

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginValidation),
    mode: "onChange",
    defaultValues: {
      username: "admin",
      password: "admin",
    }
  });

  const onSubmit = (data: LoginFormData) => {
    loginMutation(data);
  };

  if (isSuccess) return <Loading />;

  return (
    <div className="flex min-h-screen w-full bg-white dark:bg-gray-950">
      {/* Left Side - Visual/Brand */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-brand-950 items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/shape/grid-01.svg')] opacity-20 bg-center"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-brand-900/90 to-brand-950/95"></div>

        <div className="relative z-10 flex flex-col items-center justify-center text-center p-12">
          <div className="mb-8 p-4 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/10 shadow-2xl">
            <Image
              src="/images/logo-toho-real.png"
              width={200}
              height={80}
              alt="Logo"
              className="h-auto w-auto brightness-0 invert opacity-90"
              priority
            />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4 tracking-tight">Production Schedule System</h2>
          <p className="text-brand-100 max-w-md text-lg leading-relaxed">
            Streamline your manufacturing workflow with our advanced scheduling platform.
          </p>
        </div>

        {/* Decorative elements */}
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-brand-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      {/* Right Side - Form */}
      <div className="flex flex-1 flex-col items-center justify-center p-6 lg:p-12 xl:p-24 bg-gray-50 dark:bg-gray-900/50">
        <div className="w-full max-w-sm space-y-8 bg-white dark:bg-gray-900 p-8 sm:p-10 rounded-2xl shadow-xl dark:shadow-gray-900/20 border border-gray-100 dark:border-gray-800">

          <div className="text-center lg:text-left">
            <div className="lg:hidden flex justify-center mb-6">
              <Image src="/images/logo/logo-icon.svg" width={48} height={48} alt="Logo" className="w-12 h-12" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
              Welcome back
            </h1>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Please enter your details to sign in
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-5">
              <InputLabel
                label="Username"
                name="username"
                type="text"
                placeholder="Enter your username"
                register={register("username")}
                error={errors.username}
              // Add some custom styling classes if InputLabel accepts them, or rely on global styles
              />

              <div className="space-y-1">
                <InputLabel
                  label="Password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  register={register("password")}
                  error={errors.password}
                />
                {/* <div className="flex justify-end">
                    <a href="#" className="text-xs font-medium text-brand-600 hover:text-brand-500 dark:text-brand-400">
                      Forgot password?
                    </a>
                  </div> */}
              </div>

              {/* <div className="flex items-center">
                <div className="flex items-center gap-3">
                  <Checkbox checked={isChecked} onChange={setIsChecked} />
                  <label
                    className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer select-none"
                    onClick={() => setIsChecked(!isChecked)}
                  >
                    Remember for 30 days
                  </label>
                </div>
              </div> */}

              <Button
                loading={loading}
                disabled={loading}
                className="w-full h-11 text-base font-semibold shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 transition-all duration-300"
                size="md"
                type="submit"
              >
                Sign in
              </Button>
            </div>
          </form>

          <div className="text-center text-xs text-gray-400 dark:text-gray-500 mt-6">
            &copy; {new Date().getFullYear()} PT. Toho Technology Indonesia. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  );
}
