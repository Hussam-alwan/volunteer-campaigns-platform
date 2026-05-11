import StatCards from "../components/dashboard/StatCards";
import Navbar from "../components/layout/Navbar";
// استورد باقي المكونات...

const Dashboard = () => {
  return (
    <div className=" w-full">
      {/* الهيدر العلوي */}
      <Navbar />

      <div className="flex flex-col gap-8">
        <h2 className="text-3xl font-bold text-gray-800">Dashboard</h2>

        {/* قسم البطاقات الأربعة */}
        <StatCards />

        {/* القسم الأوسط: الرسم البياني والقائمة */}
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-8 bg-white p-6 rounded-3xl shadow-sm">
            {/* مكون Campaign Performance */}
            <div className="h-[300px] flex items-center justify-center border-2 border-dashed border-gray-100">
              رسم بياني (سيتم إضافته لاحقاً)
            </div>
          </div>
          <div className="col-span-12 lg:col-span-4 bg-white p-6 rounded-3xl shadow-sm">
            {/* مكون Recent Applications */}
            <h3 className="font-bold mb-4">Recent Applications</h3>
            {/* سيتم ربطه بجدول application في الـ ERD */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
