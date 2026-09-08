const fs = require('fs');
let code = fs.readFileSync('app/(main)/rent/request/RentalRequestFlow.jsx', 'utf8');

code = code.replace(
  'import { useRouter } from "next/navigation";',
  'import { useRouter, useSearchParams } from "next/navigation";'
);

code = code.replace(
  'export default function RentalRequestFlow({ user, siteSettings = {}, isReturningCustomer = false }) {',
  `export default function RentalRequestFlow({ user, siteSettings = {}, isReturningCustomer = false }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState(() => parseInt(searchParams.get("step") || "1", 10));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rentalId, setRentalId] = useState(null);
  const [copied, setCopied] = useState(false);

  const [startDate, setStartDate] = useState(() => searchParams.get("date") || "");
  const [selectedPlanId, setSelectedPlanId] = useState(() => searchParams.get("plan") || "");`
);

// We need to strip out the old state initialization lines to prevent duplicates
// Let's do a more precise replacement

code = code.replace(/const router = useRouter\(\);\n\s*const \[step, setStep\] = useState\(1\);\n\s*const \[loading, setLoading\] = useState\(false\);\n\s*const \[error, setError\] = useState\(""\);\n\s*const \[rentalId, setRentalId\] = useState\(null\);\n\s*const \[copied, setCopied\] = useState\(false\);\n\n\s*const \[startDate, setStartDate\] = useState\(""\);\n\s*const \[selectedPlanId, setSelectedPlanId\] = useState\(""\);/m, '');

// Now replace handleNext
const oldHandleNext = `    } else if (step === 3) {
      setLoading(true);
      try {
        const result = await createRentalRequest({`;
        
const newHandleNext = `    } else if (step === 3) {
      if (!user) {
        const params = new URLSearchParams({ step: '3', date: startDate, plan: selectedPlanId });
        router.push('/login?next=' + encodeURIComponent('/rent/request?' + params.toString()));
        return;
      }
      setLoading(true);
      try {
        const result = await createRentalRequest({`;
        
code = code.replace(oldHandleNext, newHandleNext);

fs.writeFileSync('app/(main)/rent/request/RentalRequestFlow.jsx', code);
