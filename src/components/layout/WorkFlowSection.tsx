import { motion } from 'framer-motion';
import { ArrowDown, ArrowRight, FileCheck2, Shield, Users } from 'lucide-react';

const WorkFlowSection = () => {
  const features = [
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Role-Based Access',
      description: 'Strict permissions for Admins, Buyers, and Solvers',
    },
    {
      icon: <FileCheck2 className="w-6 h-6" />,
      title: 'Workflow Automation',
      description: 'State machine enforced project and task lifecycles',
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Team Collaboration',
      description: 'Buyers and Solvers work together seamlessly',
    },
  ];

  const workflowSteps = [
    { step: '1', label: 'Admin assigns roles' },
    { step: '2', label: 'Buyer creates project' },
    { step: '3', label: 'Solver requests work' },
    { step: '4', label: 'Buyer assigns solver' },
    { step: '5', label: 'Solver delivers work' },
    { step: '6', label: 'Buyer reviews & accepts' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.5, ease: 'easeOut' as const },
    },
  };

  const stepVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: (i: number) => ({
      opacity: 1,
      scale: 1,
      transition: {
        delay: i * 0.1,
        duration: 0.4,
        ease: 'easeOut' as const,
      },
    }),
  };

  const pulseAnimation = {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut' as const,
    },
  };

  return (
    <div className="min-h-screen pt-5 md:pt-10 px-4">
   
      <div className=" pointer-events-none" />
      <motion.div
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
  className="text-center mb-12"
>
  <h2 className="text-3xl md:text-4xl font-bold mb-4">
    <span className="text-[#E5E7EB]">How It </span>
    <span className="text-gradient">Works</span>
  </h2>
  <p className="text-[#6B7280] max-w-2xl mx-auto">
    A streamlined workflow that connects Admins, Buyers, and Solvers for seamless project delivery.
  </p>
</motion.div>


      {/* Features Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10"
      >
        {features.map((feature, index) => (
          <motion.div
            key={index}
            variants={itemVariants}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="group relative bg-[#111827]/80 backdrop-blur-sm border border-[#1f2937] rounded-xl p-6 text-center
                       hover:border-teal-500/30 hover:shadow-[0_0_30px_rgba(20,184,166,0.1)] transition-all duration-300"
          >
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-teal-500/20 to-cyan-500/10 
                          flex items-center justify-center mx-auto mb-4 text-teal-400
                          group-hover:from-teal-500/30 group-hover:to-cyan-500/20 transition-all duration-300">
              {feature.icon}
            </div>
            <h3 className="font-semibold text-[#E5E7EB] mb-2 text-lg">{feature.title}</h3>
            <p className="text-sm text-[#6B7280] leading-relaxed">{feature.description}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* How It Works Section */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="max-w-6xl mx-auto mt-16 relative z-10"
      >
        <div className="bg-[#111827]/80 backdrop-blur-sm border border-[#1f2937] rounded-xl p-8 md:p-10
                      shadow-[0_0_60px_rgba(20,184,166,0.05)]">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10 bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
            How It Works
          </h2>

          {/* Responsive Grid - 2 columns on mobile, 3 on tablet, 6 on desktop */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 md:gap-6">
            {workflowSteps.map((item, index) => (
              <motion.div
                key={index}
                custom={index}
                variants={stepVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="relative group"
              >
                <div className="flex flex-col items-center text-center p-4 rounded-2xl
                              bg-[#0d1424]/50 border border-[#1f2937]/50
                              hover:border-teal-500/30 hover:bg-[#0d1424]/80
                              transition-all duration-300">
                  {/* Step Number */}
                  <motion.div
                    animate={pulseAnimation}
                    whileHover={{ scale: 1.1, rotate: 360, transition: { duration: 0.4 } }}
                    className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 
                             flex items-center justify-center text-white font-bold text-lg mb-3
                             shadow-[0_0_20px_rgba(20,184,166,0.4)]"
                  >
                    {item.step}
                  </motion.div>

                  {/* Label */}
                  <span className="text-sm text-[#9CA3AF] group-hover:text-teal-300 transition-colors duration-300 leading-tight">
                    {item.label}
                  </span>
                </div>

                {/* Arrow indicators - hidden on last item and responsive */}
                {index < workflowSteps.length - 1 && (
                  <>
                    {/* Desktop horizontal arrow */}
                    <motion.div
                      animate={{ x: [0, 4, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                      className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 text-teal-500/50"
                    >
                      <ArrowRight className="w-5 h-5" />
                    </motion.div>

                    <motion.div
                      animate={{ x: [0, 4, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: 'backInOut' }}
                      className="flex md:hidden justify-center absolute -bottom-4 left-1/2 -translate-x-1/2 text-teal-500/50"
                    >
                       <ArrowDown className="w-5 h-5" />
                    </motion.div>

                    {/* Mobile/Tablet flow indicator - only show after odd items (col 2) on mobile, after every 3rd on tablet */}
                   
                    {/* {(index + 1) % 3 === 0 && index < workflowSteps.length - 1 && (
                      <motion.div
                        animate={{ y: [0, 4, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                        className="hidden md:flex xl:hidden justify-center absolute -bottom-4 left-1/2 -translate-x-1/2 text-teal-500/50"
                      >
                        <ArrowDown className="w-5 h-5" />
                      </motion.div>
                    )} */}
                  </>
                )}
              </motion.div>
            ))}
          </div>

          {/* Progress line for desktop */}
          <div className="hidden xl:block mt-8">
            <div className="h-1 bg-[#1f2937] rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: '100%' }}
                viewport={{ once: true }}
                transition={{ duration: 1.5, delay: 0.5, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-teal-500 to-cyan-500"
              />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default WorkFlowSection;
