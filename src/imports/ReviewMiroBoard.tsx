import svgPaths from "./svg-wzl4efprf9";

function MuiTypographyRoot() {
  return (
    <div className="h-[56.016px] relative shrink-0 w-full" data-name="MuiTypographyRoot">
      <p className="absolute font-['Post_No_Bills_Colombo_Medium:Regular',sans-serif] leading-[56.016px] left-[193px] not-italic text-[#1976d2] text-[48px] text-center text-nowrap top-[0.5px] translate-x-[-50%]">Data Science App</p>
    </div>
  );
}

function MuiSvgIconRoot() {
  return (
    <div className="absolute left-0 size-[22px] top-0" data-name="MuiSvgIconRoot">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22 22">
        <g id="MuiSvgIconRoot">
          <path d={svgPaths.p332b5600} fill="var(--fill-0, white)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function MuiButtonEndIcon() {
  return (
    <div className="absolute left-[184px] size-[22px] top-[14px]" data-name="MuiButtonEndIcon">
      <MuiSvgIconRoot />
    </div>
  );
}

function MuiButtonBaseRoot() {
  return (
    <div className="absolute bg-[#007aff] h-[48px] left-[180px] rounded-[12px] shadow-[0px_4px_14px_0px_rgba(0,122,255,0.25)] top-[16.97px] w-[239px]" data-name="MuiButtonBaseRoot">
      <p className="absolute font-['Roboto:Medium',sans-serif] font-medium leading-[30.8px] left-[120px] text-[17.6px] text-center text-nowrap text-white top-[9px] tracking-[0.5028px] translate-x-[-50%]" style={{ fontVariationSettings: "'wdth' 100" }}>
        Upload CSV
      </p>
      <MuiButtonEndIcon />
    </div>
  );
}

function MuiSvgIconRoot1() {
  return (
    <div className="absolute bg-white left-[-4px] overflow-clip size-[24px] top-[-4px]" data-name="MuiSvgIconRoot">
      <div className="absolute left-0 size-[24px] top-0" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
          <path d={svgPaths.p1c665200} fill="var(--fill-0, #007AFF)" id="Vector" />
        </svg>
      </div>
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[normal] left-[12px] not-italic text-[12px] text-center text-nowrap text-white top-[4px] translate-x-[-50%]">1</p>
    </div>
  );
}

function MuiStepLabelIconContainer() {
  return (
    <div className="absolute bg-white h-[35px] left-[106px] top-[5px] w-[24px]" data-name="MuiStepLabelIconContainer">
      <MuiSvgIconRoot1 />
    </div>
  );
}

function MuiStepLabelLabel() {
  return <div className="absolute h-[20.016px] left-0 top-[40px] w-[235.25px]" data-name="MuiStepLabelLabel" />;
}

function MuiStepLabelRoot() {
  return (
    <div className="absolute h-[60.016px] left-[-60px] top-[17.97px] w-[235.25px]" data-name="MuiStepLabelRoot">
      <MuiStepLabelIconContainer />
      <MuiStepLabelLabel />
      <p className="absolute font-['Roboto:SemiBold',sans-serif] font-semibold leading-[20.02px] left-[113px] text-[#1976d2] text-[14px] text-center text-nowrap top-[25px] tracking-[0.1499px] translate-x-[-50%]" style={{ fontVariationSettings: "'wdth' 100" }}>
        Explore
      </p>
    </div>
  );
}

function StyledDiv() {
  return (
    <div className="absolute h-[137px] left-[49px] top-[49px] w-[129px]" data-name="Styled(div)">
      <MuiButtonBaseRoot />
      <MuiStepLabelRoot />
    </div>
  );
}

function MuiButtonBaseRoot1() {
  return (
    <div className="bg-[#86868b] h-[48px] opacity-[0.48] relative rounded-[12px] shrink-0 w-[239px]" data-name="MuiButtonBaseRoot">
      <p className="absolute font-['Roboto:Medium',sans-serif] font-medium leading-[28px] left-[120px] text-[16px] text-center text-nowrap text-white top-[10px] tracking-[0.4571px] translate-x-[-50%]" style={{ fontVariationSettings: "'wdth' 100" }}>
        Continue
      </p>
    </div>
  );
}

function Frame() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[84px] items-start left-[224px] top-[180.98px] w-[201px]">
      {[...Array(3).keys()].map((_, i) => (
        <MuiButtonBaseRoot1 key={i} />
      ))}
    </div>
  );
}

function MuiSvgIconRoot2() {
  return (
    <div className="absolute left-0 overflow-clip size-[24px] top-0" data-name="MuiSvgIconRoot">
      <div className="absolute left-0 size-[24px] top-0" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
          <path d={svgPaths.p1c665200} fill="var(--fill-0, black)" fillOpacity="0.38" id="Vector" />
        </svg>
      </div>
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[normal] left-[12px] not-italic text-[12px] text-center text-nowrap text-white top-[4px] translate-x-[-50%]">3</p>
    </div>
  );
}

function MuiStepLabelIconContainer1() {
  return (
    <div className="absolute h-[38px] left-[106px] top-[4px] w-[24px]" data-name="MuiStepLabelIconContainer">
      <MuiSvgIconRoot2 />
    </div>
  );
}

function MuiStepLabelLabel1() {
  return (
    <div className="absolute h-[16px] left-0 top-[28px] w-[235px]" data-name="MuiStepLabelLabel">
      <p className="absolute font-['Roboto:Regular',sans-serif] font-normal leading-[20.02px] left-[118.42px] text-[14px] text-[rgba(0,0,0,0.6)] text-center text-nowrap top-0 tracking-[0.1499px] translate-x-[-50%]" style={{ fontVariationSettings: "'wdth' 100" }}>
        Data Augmentation
      </p>
    </div>
  );
}

function MuiStepLabelRoot1() {
  return (
    <div className="absolute h-[60.016px] left-[8px] top-[103px] w-[235.25px]" data-name="MuiStepLabelRoot">
      <MuiStepLabelIconContainer1 />
      <MuiStepLabelLabel1 />
    </div>
  );
}

function MuiStepConnectorLine() {
  return <div className="border-[#bdbdbd] border-[1px_0px_0px] border-solid h-[27px] w-[66px]" data-name="MuiStepConnectorLine" />;
}

function MuiStepRoot() {
  return (
    <div className="absolute h-[141px] left-[-26px] top-[213.97px] w-[251px]" data-name="MuiStepRoot">
      <MuiStepLabelRoot1 />
      <div className="absolute flex h-[66px] items-center justify-center left-[126px] top-[23px] w-[27px]" style={{ "--transform-inner-width": "0", "--transform-inner-height": "1" } as React.CSSProperties}>
        <div className="flex-none rotate-[90deg] scale-y-[-100%]">
          <MuiStepConnectorLine />
        </div>
      </div>
    </div>
  );
}

function MuiSvgIconRoot3() {
  return (
    <div className="absolute left-0 overflow-clip size-[24px] top-0" data-name="MuiSvgIconRoot">
      <div className="absolute left-0 size-[24px] top-0" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
          <path d={svgPaths.p1c665200} fill="var(--fill-0, black)" fillOpacity="0.38" id="Vector" />
        </svg>
      </div>
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[normal] left-[12px] not-italic text-[12px] text-center text-nowrap text-white top-[4px] translate-x-[-50%]">4</p>
    </div>
  );
}

function MuiStepLabelIconContainer2() {
  return (
    <div className="absolute h-[38px] left-[106px] top-[4px] w-[24px]" data-name="MuiStepLabelIconContainer">
      <MuiSvgIconRoot3 />
    </div>
  );
}

function MuiStepLabelLabel2() {
  return (
    <div className="absolute h-[16px] left-0 top-[28px] w-[235px]" data-name="MuiStepLabelLabel">
      <p className="absolute font-['Roboto:Regular',sans-serif] font-normal leading-[20.02px] left-[118.42px] text-[14px] text-[rgba(0,0,0,0.6)] text-center text-nowrap top-0 tracking-[0.1499px] translate-x-[-50%]" style={{ fontVariationSettings: "'wdth' 100" }}>
        Data Visualization
      </p>
    </div>
  );
}

function MuiStepLabelRoot2() {
  return (
    <div className="absolute h-[60.016px] left-[-18px] top-[455.97px] w-[235.25px]" data-name="MuiStepLabelRoot">
      <MuiStepLabelIconContainer2 />
      <MuiStepLabelLabel2 />
    </div>
  );
}

function MuiStepConnectorLine1() {
  return <div className="border-[#bdbdbd] border-[1px_0px_0px] border-solid h-[27px] w-[66px]" data-name="MuiStepConnectorLine" />;
}

function MuiSvgIconRoot4() {
  return (
    <div className="absolute left-0 overflow-clip size-[24px] top-0" data-name="MuiSvgIconRoot">
      <div className="absolute left-0 size-[24px] top-0" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
          <path d={svgPaths.p1c665200} fill="var(--fill-0, black)" fillOpacity="0.38" id="Vector" />
        </svg>
      </div>
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[normal] left-[12px] not-italic text-[12px] text-center text-nowrap text-white top-[4px] translate-x-[-50%]">2</p>
    </div>
  );
}

function MuiStepLabelIconContainer3() {
  return (
    <div className="absolute h-[38px] left-[106px] top-[4px] w-[24px]" data-name="MuiStepLabelIconContainer">
      <MuiSvgIconRoot4 />
    </div>
  );
}

function MuiStepLabelLabel3() {
  return (
    <div className="absolute h-[16px] left-0 top-[28px] w-[235px]" data-name="MuiStepLabelLabel">
      <p className="absolute font-['Roboto:Regular',sans-serif] font-normal leading-[20.02px] left-[118.42px] text-[14px] text-[rgba(0,0,0,0.6)] text-center text-nowrap top-0 tracking-[0.1499px] translate-x-[-50%]" style={{ fontVariationSettings: "'wdth' 100" }}>
        Data Manipulation
      </p>
    </div>
  );
}

function MuiStepLabelRoot3() {
  return (
    <div className="absolute h-[60.016px] left-[-17px] top-[177.97px] w-[235.25px]" data-name="MuiStepLabelRoot">
      <MuiStepLabelIconContainer3 />
      <MuiStepLabelLabel3 />
    </div>
  );
}

function MuiPaperRoot() {
  return (
    <div className="h-[701.141px] relative rounded-[16px] shrink-0 w-full" data-name="MuiPaperRoot" style={{ backgroundImage: "linear-gradient(152.171deg, rgb(255, 255, 255) 6.1733%, rgb(245, 247, 250) 93.827%)" }}>
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0.06)] border-solid inset-0 pointer-events-none rounded-[16px]" />
      <StyledDiv />
      <Frame />
      <MuiStepRoot />
      <MuiStepLabelRoot2 />
      <div className="absolute flex h-[66px] items-center justify-center left-[100px] top-[373.97px] w-[27px]" style={{ "--transform-inner-width": "0", "--transform-inner-height": "1" } as React.CSSProperties}>
        <div className="flex-none rotate-[90deg] scale-y-[-100%]">
          <MuiStepConnectorLine1 />
        </div>
      </div>
      <MuiStepLabelRoot3 />
      <div className="absolute flex h-[66px] items-center justify-center left-[101px] top-[109.97px] w-[27px]" style={{ "--transform-inner-width": "0", "--transform-inner-height": "1" } as React.CSSProperties}>
        <div className="flex-none rotate-[90deg] scale-y-[-100%]">
          <MuiStepConnectorLine1 />
        </div>
      </div>
      <p className="absolute font-['Roboto:Medium',sans-serif] font-medium h-[30px] leading-[28px] left-[596px] text-[16px] text-[rgba(0,0,0,0.72)] text-center top-[53.98px] tracking-[0.4571px] translate-x-[-50%] w-[256px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        Can support CSV upto 100 mb
      </p>
      <p className="absolute font-['Roboto:Medium',sans-serif] font-medium h-[27px] leading-[28px] left-[30px] text-[16px] text-[rgba(0,0,0,0.72)] top-[593.98px] tracking-[0.4571px] w-[426px]" style={{ fontVariationSettings: "'wdth' 100" }}>{`JSON & Excel Support coming soon`}</p>
    </div>
  );
}

function MuiContainerRoot() {
  return (
    <div className="bg-[#f5f5f5] h-[993.172px] relative shrink-0 w-full" data-name="MuiContainerRoot">
      <div className="size-full">
        <div className="content-stretch flex flex-col items-start pb-0 pt-[32px] px-[24px] relative size-full">
          <MuiTypographyRoot />
          <p className="font-['Post_No_Bills_Colombo_Medium:Regular',sans-serif] h-[27px] leading-[28px] not-italic relative shrink-0 text-[16px] text-[rgba(0,0,0,0.72)] tracking-[0.4571px] w-[426px]">Analyze, Transform, Visualize — Visually</p>
          <MuiPaperRoot />
        </div>
      </div>
    </div>
  );
}

export default function ReviewMiroBoard() {
  return (
    <div className="bg-white content-stretch flex flex-col items-start relative size-full" data-name="Review Miro Board">
      <MuiContainerRoot />
    </div>
  );
}