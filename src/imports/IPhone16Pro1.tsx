import imgIPhone16Pro1 from "figma:asset/72be1fe6085c2fb40513fe5f025daa649235f405.png";

function Button() {
  return (
    <div className="absolute bg-[rgba(30,30,30,0.5)] h-[49px] left-[59px] opacity-[0.84] rounded-[8px] top-[461px] w-[283px]" data-name="Button">
      <div className="content-stretch flex gap-[8px] items-center justify-center overflow-clip p-[12px] relative rounded-[inherit] size-full">
        <p className="font-['Roboto_Mono:Regular',sans-serif] font-normal leading-[1.3] relative shrink-0 text-[#f5f5f5] text-[16px] text-nowrap">Sign In</p>
      </div>
      <div aria-hidden="true" className="absolute border border-solid border-white inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function Button1() {
  return (
    <div className="absolute bg-[rgba(30,30,30,0.5)] h-[49px] left-[59px] opacity-[0.84] rounded-[8px] top-[523px] w-[283px]" data-name="Button">
      <div className="content-stretch flex gap-[8px] items-center justify-center overflow-clip p-[12px] relative rounded-[inherit] size-full">
        <p className="font-['Roboto_Mono:Regular',sans-serif] font-normal leading-[1.3] relative shrink-0 text-[#f5f5f5] text-[16px] text-nowrap">Sign up</p>
      </div>
      <div aria-hidden="true" className="absolute border border-solid border-white inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

export default function IPhone16Pro() {
  return (
    <div className="relative size-full" data-name="iPhone 16 Pro - 1">
      <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover opacity-[0.52] pointer-events-none size-full" src={imgIPhone16Pro1} />
      <p className="absolute font-['Post_No_Bills_Colombo_ExtraBold:Regular',sans-serif] leading-[56.016px] left-[201px] not-italic text-[#f5f9fa] text-[40px] text-center text-nowrap top-[404px] translate-x-[-50%]">Data Science App</p>
      <Button />
      <Button1 />
      <div className="absolute bg-[#929292] h-[67px] left-[-45px] top-[21px] w-[211px]" />
    </div>
  );
}