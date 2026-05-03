import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Truck, Settings } from "lucide-react";

const couriers = [
  {
    name: "Pathao Courier",
    logo: "🟢",
    website: "https://merchant.pathao.com",
    apiDocs: "https://merchant.pathao.com/api/v1",
    description: "বাংলাদেশের সবচেয়ে জনপ্রিয় কুরিয়ার সার্ভিস। API দিয়ে অটোমেটিক অর্ডার তৈরি, ট্র্যাকিং ও প্রাইসিং।",
    features: ["অর্ডার তৈরি API", "রিয়েল-টাইম ট্র্যাকিং", "প্রাইস ক্যালকুলেশন", "COD কালেকশন"],
    setupSteps: [
      "Pathao Merchant Panel-এ রেজিস্ট্রেশন করুন",
      "Merchant Panel → Settings → API Credentials থেকে Client ID ও Secret নিন",
      "Lovable Cloud-এ PATHAO_CLIENT_ID ও PATHAO_CLIENT_SECRET সিক্রেট যোগ করুন",
      "Edge Function তৈরি করুন যা Pathao API কল করবে",
    ],
    envKeys: ["PATHAO_CLIENT_ID", "PATHAO_CLIENT_SECRET", "PATHAO_BASE_URL"],
    status: "available",
  },
  {
    name: "Steadfast Courier",
    logo: "🔵",
    website: "https://steadfast.com.bd",
    apiDocs: "https://portal.steadfast.com.bd/api-docs",
    description: "দ্রুত ও নির্ভরযোগ্য কুরিয়ার সার্ভিস। সিম্পল API ইন্টিগ্রেশন।",
    features: ["অর্ডার বুকিং", "বাল্ক অর্ডার", "ট্র্যাকিং", "COD রিপোর্ট"],
    setupSteps: [
      "Steadfast Portal-এ রেজিস্ট্রেশন করুন",
      "Portal → Profile → API Settings থেকে API Key ও Secret Key নিন",
      "Lovable Cloud-এ STEADFAST_API_KEY ও STEADFAST_SECRET_KEY সিক্রেট যোগ করুন",
      "Edge Function তৈরি করুন",
    ],
    envKeys: ["STEADFAST_API_KEY", "STEADFAST_SECRET_KEY"],
    status: "available",
  },
  {
    name: "RedX",
    logo: "🔴",
    website: "https://redx.com.bd",
    apiDocs: "https://redx.com.bd/api-doc",
    description: "ই-কমার্স ফোকাসড কুরিয়ার সার্ভিস। সহজ ইন্টিগ্রেশন।",
    features: ["অর্ডার তৈরি", "ট্র্যাকিং", "এরিয়া চেক", "COD"],
    setupSteps: [
      "RedX-এ Merchant রেজিস্ট্রেশন করুন",
      "Dashboard → API Token জেনারেট করুন",
      "Lovable Cloud-এ REDX_API_TOKEN সিক্রেট যোগ করুন",
    ],
    envKeys: ["REDX_API_TOKEN"],
    status: "available",
  },
  {
    name: "Paper Fly",
    logo: "🟡",
    website: "https://www.paperfly.com.bd",
    apiDocs: "https://go.paperfly.com.bd",
    description: "Nationwide ডেলিভারি নেটওয়ার্ক।",
    features: ["অর্ডার ম্যানেজমেন্ট", "ট্র্যাকিং", "Cash Collection"],
    setupSteps: [
      "Paper Fly Merchant Account তৈরি করুন",
      "API credentials সংগ্রহ করুন",
      "Lovable Cloud-এ সিক্রেট যোগ করুন",
    ],
    envKeys: ["PAPERFLY_API_KEY"],
    status: "available",
  },
];

const CourierIntegration = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-display font-bold flex items-center gap-3">
            <Truck className="w-8 h-8 text-primary" /> Courier Integration
          </h1>
          <p className="text-muted-foreground">
            কুরিয়ার সার্ভিস ইন্টিগ্রেট করুন — API ক্রেডেনশিয়াল সেটআপ করলেই অটো অর্ডার ও ট্র্যাকিং চালু হবে
          </p>
        </div>

        <div className="grid gap-6">
          {couriers.map((courier) => (
            <Card key={courier.name}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-3">
                    <span className="text-2xl">{courier.logo}</span>
                    {courier.name}
                  </CardTitle>
                  <Badge variant="outline">Setup Required</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">{courier.description}</p>

                <div className="flex flex-wrap gap-2">
                  {courier.features.map(f => (
                    <Badge key={f} variant="secondary">{f}</Badge>
                  ))}
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-medium text-foreground mb-2 flex items-center gap-2">
                    <Settings className="w-4 h-4" /> সেটআপ ধাপসমূহ
                  </h4>
                  <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1">
                    {courier.setupSteps.map((step, i) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ol>
                </div>

                <div className="bg-muted/50 p-3 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">প্রয়োজনীয় Secrets:</p>
                  <div className="flex flex-wrap gap-1">
                    {courier.envKeys.map(k => (
                      <code key={k} className="text-xs bg-background px-2 py-0.5 rounded border">{k}</code>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" asChild>
                    <a href={courier.website} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 mr-2" /> Merchant Panel
                    </a>
                  </Button>
                  <Button variant="outline" asChild>
                    <a href={courier.apiDocs} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 mr-2" /> API Docs
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

export default CourierIntegration;
