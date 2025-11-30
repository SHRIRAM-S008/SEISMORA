import BlurText from "./ui/blur-text";

const BlurTextExample = () => {
  const handleAnimationComplete = () => {
    console.log('Animation completed!');
  };

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold mb-8">BlurText Examples</h1>
      
      <div>
        <h2 className="text-xl font-semibold mb-4">Basic Example</h2>
        <BlurText
          text="Isn't this so cool?!"
          delay={150}
          animateBy="words"
          direction="top"
          onAnimationComplete={handleAnimationComplete}
          className="text-2xl mb-8"
        />
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Letter Animation</h2>
        <BlurText
          text="This animates by letters!"
          delay={50}
          animateBy="letters"
          direction="bottom"
          className="text-lg text-blue-600"
        />
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Custom Animation</h2>
        <BlurText
          text="Custom blur and fade effects"
          delay={100}
          animateBy="words"
          direction="top"
          animationFrom={{ filter: 'blur(20px)', opacity: 0, scale: 0.8 }}
          animationTo={[
            { filter: 'blur(10px)', opacity: 0.5, scale: 0.9 },
            { filter: 'blur(0px)', opacity: 1, scale: 1 }
          ]}
          className="text-3xl font-bold text-purple-600"
        />
      </div>
    </div>
  );
};

export default BlurTextExample;
