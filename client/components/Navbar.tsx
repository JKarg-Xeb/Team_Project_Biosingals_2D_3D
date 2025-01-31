"use client"

import React from 'react'
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { useEffect } from 'react';

gsap.registerPlugin(ScrollTrigger);

export default function Navbar() {
    
    const NavList = ['Dashboard'];

    useEffect(() => {
        gsap.fromTo("#nav_list .nav-item", {
           y: 3, opacity:0
        }, {
            y:-3, 
            opacity: 1,
            duration: 0.3,  
            ease: "power3.out",
            stagger: 0.1, 
        })
        ScrollTrigger.create({
            start: "top top", 
            onUpdate: (self) => {
                if (self.direction === 1) {
                    gsap.to("#nav_list", { 
                        opacity: 0, 
                        y: -10, 
                        duration: 0.1, 
                        ease: "power2.out" });
                    gsap.to('#acredo_logo' ,{
                        y:"2vh", 
                        duration: 0.6, 
                        scale: 1.5,
                        ease: "expoScale"
                    })
                } else if (self.direction === -1) {
                    gsap.to("#nav_list", { 
                        opacity: 1, 
                        y: 0, 
                        duration: 0.1, 
                        ease: "power2.out" 
                    });
                    gsap.to('#acredo_logo' ,{
                        y:0, 
                        duration: 0.6, 
                        scale: 1, 
                        ease: "expoScale"
                    })
                }
            },
        });

    }, [])

    
    

  return (
    <nav id="nav">
        <div className='fixed top-0 w-full z-50 h-30 flex flex-col bg-[#ffffff] '>
            <div id="nav_list" className='flex-row flex-center mt-5 pb-3 sm:px-10'>
                {NavList.map((nav) => (
                    <div key={nav} className='nav-item text-black hover:text-orange-300 transition-all mx-10 cursor-pointer opacity-0'>{nav}</div>
                ))}
            </div>
        </div>
    </nav>
  )
}

