import React from 'react'
import { FcOpenedFolder } from "react-icons/fc"; 
import Company from './footer/company'
import Legal from './footer/legal';
import Support from './footer/support';
import Platform from './footer/platform';

const Footer = () => {

    const PlatformData = [
      { text: "Security Suite", link: "/security" },
      { text: "Biometric Auth", link: "/biometrics" },
      { text: "Integrations", link: "/integrations" },
      { text: "API Access", link: "/api" },
      { text: "Mobile App", link: "/mobile" },
    ];
    
    const CompanyData = [
      { text: "About Us", link: "/about" },
      { text: "Our Team", link: "/team" },
      { text: "Careers", link: "/careers" },
      { text: "Press & Media", link: "/press" },
      { text: "Contact Sales", link: "/contact" },
    ];
    
    const SupportData = [
      { text: "Help Center", link: "/help" },
      { text: "Community Forum", link: "/community" },
      { text: "Developer Docs", link: "/docs" },
      { text: "System Status", link: "/status" },
      { text: "Webinars", link: "/webinars" },
      { text: "Customer Stories", link: "/stories" },
      { text: "Feedback", link: "/feedback" },
    ];
    
    const LegalData = [
      { text: "Privacy Policy", link: "/privacy" },
      { text: "Terms of Service", link: "/terms" },
      { text: "Cookie Policy", link: "/cookies" },
      { text: "Compliance", link: "/compliance" },
      { text: "Data Processing", link: "/dpa" },
      { text: "Accessibility", link: "/accessibility" },
    ];
    
  return (
    <>
    <div className='place-self-center flex align pt-5'>
        <h1 className='text-2xl md:text-4xl my-5 font-bold'>Octfix</h1>
        <div className="text-4xl md:text-5xl my-5"><FcOpenedFolder /></div>
    </div>
    <div className='grid grid-cols-2 md:grid-cols-4 gap-[2rem_2rem] p-7 md:place-items-center'>
      <Company data={CompanyData} />
      <Legal data={LegalData} />
      <Support data={SupportData} />
      <Platform data={PlatformData} />
    </div>
    <p className="text-[12px] text-center text-gray-600 font-medium">
        © 2026 Octfix. All rights reserved.
    </p>
    </>
  )
}

export default Footer
