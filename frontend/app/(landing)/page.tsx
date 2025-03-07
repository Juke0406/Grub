"use client";

import { Button } from "@/components/ui/button";
import { UtensilsCrossed } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <header className="relative bg-gradient-to-b from-green-500/90 to-emerald-600/90 text-white">
        <div className="absolute inset-0 z-0 bg-emerald-600" />
        <div className="relative z-10 px-4 py-16 sm:px-6 lg:px-8">
          <nav className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-white/10 backdrop-blur-sm p-2 rounded-lg">
                <UtensilsCrossed className="size-6 text-white" />
              </div>
              <span className="text-xl font-bold">Grub</span>
            </div>
            <Button
              size="lg"
              className="bg-white text-emerald-600 hover:bg-white/90"
              onClick={() => {
                document.cookie = "portal=user;path=/";
                window.location.href = "/browse/all";
              }}
            >
              Start Shopping
            </Button>
          </nav>
          <div className="mx-auto max-w-4xl text-center mt-24">
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
              Save Food. Save Money.
              <br />
              Save Earth.
            </h1>
            <p className="mt-6 text-lg leading-8">
              Join our mission to reduce food waste by connecting you with local
              bakeries and supermarkets offering quality food at discounted
              prices before they go to waste.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Button
                size="lg"
                className="bg-white text-emerald-600 hover:bg-white/90"
                onClick={() => {
                  document.cookie = "portal=user;path=/";
                  window.location.href = "/browse/all";
                }}
              >
                Start Saving Today
              </Button>
              <Button
                variant="link"
                className="text-white"
                onClick={() => {
                  const element = document.getElementById("how-it-works");
                  element?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Learn more ↓
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-3">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-emerald-600 mb-3">
                For Consumers
              </h3>
              <p className="text-gray-600">
                Get quality food at discounted prices while helping reduce food
                waste in your community.
              </p>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-emerald-600 mb-3">
                For Businesses
              </h3>
              <p className="text-gray-600">
                Reduce waste, recover costs, and make a positive impact on the
                environment by selling surplus food.
              </p>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-emerald-600 mb-3">
                For the Planet
              </h3>
              <p className="text-gray-600">
                Every purchase helps reduce food waste and its impact on our
                environment and climate change.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-3xl font-bold text-center mb-16">How It Works</h2>
          <div className="grid gap-12 lg:grid-cols-3">
            <div>
              <div className="text-center mb-4">
                <span className="inline-block bg-emerald-100 text-emerald-600 text-xl font-bold rounded-full w-10 h-10 leading-10">
                  1
                </span>
              </div>
              <h3 className="text-lg font-semibold text-center mb-2">
                Browse & Reserve
              </h3>
              <p className="text-gray-600 text-center">
                Find discounted food items from local businesses near you and
                reserve them for pickup.
              </p>
            </div>
            <div>
              <div className="text-center mb-4">
                <span className="inline-block bg-emerald-100 text-emerald-600 text-xl font-bold rounded-full w-10 h-10 leading-10">
                  2
                </span>
              </div>
              <h3 className="text-lg font-semibold text-center mb-2">
                Pick Up Food
              </h3>
              <p className="text-gray-600 text-center">
                Collect your reserved items during the specified pickup window
                from the store.
              </p>
            </div>
            <div>
              <div className="text-center mb-4">
                <span className="inline-block bg-emerald-100 text-emerald-600 text-xl font-bold rounded-full w-10 h-10 leading-10">
                  3
                </span>
              </div>
              <h3 className="text-lg font-semibold text-center mb-2">
                Save & Share
              </h3>
              <p className="text-gray-600 text-center">
                Enjoy quality food at great prices and help spread the word
                about food waste reduction.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Join Now Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-emerald-600 text-white">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold mb-6">Join the Movement Today</h2>
          <p className="mb-8">
            Start saving money on quality food while helping reduce food waste
            in your community.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white text-emerald-600 hover:bg-white/90"
              onClick={() => {
                document.cookie = "portal=user;path=/";
                window.location.href = "/browse/all";
              }}
            >
              I Want to Save Food
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white/20 bg-transparent hover:text-white hover:border-0 shadow-none"
              onClick={() => {
                document.cookie = "portal=business;path=/";
                window.location.href = "/business";
              }}
            >
              I&apos;m a Business
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-900 text-gray-400">
        <div className="mx-auto max-w-7xl text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <UtensilsCrossed className="size-5" />
            <span className="font-semibold text-white">Grub</span>
          </div>
          <p className="text-sm">
            © 2024 Grub. All rights reserved. Helping reduce food waste, one
            meal at a time.
          </p>
        </div>
      </footer>
    </div>
  );
}
